// Store-module counterpart of websiteWizardApi.js — talks to the
// /api/store endpoints that create a Store (as opposed to storeTemplateApi.js,
// which manages the StoreTemplate library).
const API_BASE = import.meta.env.VITE_WEBSITE_WIZARD_API_BASE || 'http://localhost:5500/api';

async function requestJson(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${method} ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

function unwrap(json) {
  if (!json || json.success === false) {
    throw new Error(json?.error || 'Unknown API error');
  }
  return json;
}

export const storeApi = {
  // POST /api/store — "start from scratch" (no template)
  createStore: async ({ storeName, currency, status, description } = {}) => {
    const json = unwrap(
      await requestJson('/store', {
        method: 'POST',
        body: { storeName, currency, status, description },
      })
    );
    return json.data; // { store }
  },

  // POST /api/store/create-from-template
  // Flow: Choose Template -> Clone Template -> Create Store ->
  //       Create Default Pages -> Copy Demo Products -> Return Store
  createStoreFromTemplate: async ({
    templateId,
    storeName,
    currency,
    status,
    installDemo,
    description,
  } = {}) => {
    const json = unwrap(
      await requestJson('/store/create-from-template', {
        method: 'POST',
        body: { templateId, storeName, currency, status, installDemo, description },
      })
    );
    return json.data; // { store, pages, products, collections, discount }
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Collections Module — admin CRUD used by the Collections tab in
// StoresTab.jsx. Create / Edit / Delete, plus a Products link.
// ─────────────────────────────────────────────────────────────────────────
export const collectionApi = {
  list: async (storeId, { search } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const json = unwrap(await requestJson(`/store/${storeId}/admin/collections${qs}`));
    return json.data;
  },

  get: async (storeId, id) => {
    const json = unwrap(await requestJson(`/store/${storeId}/admin/collections/${id}`));
    return json.data;
  },

  create: async (storeId, payload) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/collections`, { method: 'POST', body: payload })
    );
    return json.data;
  },

  update: async (storeId, id, payload) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/collections/${id}`, { method: 'PATCH', body: payload })
    );
    return json.data;
  },

  remove: async (storeId, id) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/collections/${id}`, { method: 'DELETE' })
    );
    return json.data;
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Customer Module — admin CRUD used by the Customers tab in StoresTab.jsx.
// Create / Edit / Delete.
// ─────────────────────────────────────────────────────────────────────────
export const customerApi = {
  list: async (storeId, { search } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const json = unwrap(await requestJson(`/store/${storeId}/admin/customers${qs}`));
    return json.data;
  },

  get: async (storeId, id) => {
    const json = unwrap(await requestJson(`/store/${storeId}/admin/customers/${id}`));
    return json.data;
  },

  create: async (storeId, payload) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/customers`, { method: 'POST', body: payload })
    );
    return json.data;
  },

  update: async (storeId, id, payload) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/customers/${id}`, { method: 'PATCH', body: payload })
    );
    return json.data;
  },

  remove: async (storeId, id) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/customers/${id}`, { method: 'DELETE' })
    );
    return json.data;
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Shipping Module — admin config used by the Shipping tab in StoresTab.jsx.
// One StoreShipping document per store: Shipping Zones (each with
// Shipping Charges + Delivery Time per rate) plus a store-wide Free
// Shipping threshold.
// ─────────────────────────────────────────────────────────────────────────
export const shippingApi = {
  get: async (storeId) => {
    const json = unwrap(await requestJson(`/store/${storeId}/admin/shipping`));
    return json.data;
  },

  updateSettings: async (storeId, payload) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/shipping`, { method: 'PATCH', body: payload })
    );
    return json.data;
  },

  createZone: async (storeId, payload) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/shipping/zones`, { method: 'POST', body: payload })
    );
    return json.data;
  },

  updateZone: async (storeId, zoneId, payload) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/shipping/zones/${zoneId}`, { method: 'PATCH', body: payload })
    );
    return json.data;
  },

  removeZone: async (storeId, zoneId) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/shipping/zones/${zoneId}`, { method: 'DELETE' })
    );
    return json.data;
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Payments Module — admin config used by the Payments tab in StoresTab.jsx.
// One StorePayment document per store; each gateway (Razorpay, Stripe,
// PayPal, Cash on Delivery) is an independently-togglable sub-resource, so
// a store can offer more than one method at checkout.
// ─────────────────────────────────────────────────────────────────────────
export const PAYMENT_METHODS = ['razorpay', 'stripe', 'paypal', 'cod'];

export const paymentApi = {
  get: async (storeId) => {
    const json = unwrap(await requestJson(`/store/${storeId}/admin/payments`));
    return json.data;
  },

  updateSettings: async (storeId, payload) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/payments`, { method: 'PATCH', body: payload })
    );
    return json.data;
  },

  // method: 'razorpay' | 'stripe' | 'paypal' | 'cod'
  updateMethod: async (storeId, method, payload) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/payments/${method}`, { method: 'PATCH', body: payload })
    );
    return json.data;
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Email Sender Module — admin config used by the Email sender tab in
// StoresTab.jsx (sub-tabs: SMTP, Templates, Order Mail, Welcome Mail). One
// StoreEmailSettings document per store; each transactional event is an
// independently-editable template sub-resource.
// ─────────────────────────────────────────────────────────────────────────
export const EMAIL_TEMPLATE_TYPES = ['orderConfirmation', 'shippingUpdate', 'orderCancelled', 'abandonedCart', 'welcome'];

export const emailApi = {
  get: async (storeId) => {
    const json = unwrap(await requestJson(`/store/${storeId}/admin/email`));
    return json.data;
  },

  updateSender: async (storeId, payload) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/email/sender`, { method: 'PATCH', body: payload })
    );
    return json.data;
  },

  updateSmtp: async (storeId, payload) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/email/smtp`, { method: 'PATCH', body: payload })
    );
    return json.data;
  },

  // type: 'orderConfirmation' | 'shippingUpdate' | 'orderCancelled' | 'abandonedCart' | 'welcome'
  updateTemplate: async (storeId, type, payload) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/email/templates/${type}`, { method: 'PATCH', body: payload })
    );
    return json.data;
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Analytics Module — read-only summary used by the Analytics tab in
// StoresTab.jsx (Visitors, Sales, Orders, Revenue, Conversion + Top
// products). Computed on the fly from orders + storefront visit pings, so
// there's nothing to create/update — just a single GET.
// ─────────────────────────────────────────────────────────────────────────
export const analyticsApi = {
  get: async (storeId, { days = 30 } = {}) => {
    const json = unwrap(await requestJson(`/store/${storeId}/admin/analytics?days=${days}`));
    return json.data;
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Discounts Module — admin CRUD used by the Discounts tab in StoresTab.jsx.
// Create / Edit / Delete a coupon (code, Percentage/Flat value, Expiry,
// Minimum Order).
// ─────────────────────────────────────────────────────────────────────────
export const DISCOUNT_TYPES = ['Percentage', 'Flat', 'FreeShipping'];

export const discountApi = {
  list: async (storeId, { search } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const json = unwrap(await requestJson(`/store/${storeId}/admin/discounts${qs}`));
    return json.data;
  },

  get: async (storeId, id) => {
    const json = unwrap(await requestJson(`/store/${storeId}/admin/discounts/${id}`));
    return json.data;
  },

  create: async (storeId, payload) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/discounts`, { method: 'POST', body: payload })
    );
    return json.data;
  },

  update: async (storeId, id, payload) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/discounts/${id}`, { method: 'PATCH', body: payload })
    );
    return json.data;
  },

  remove: async (storeId, id) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/discounts/${id}`, { method: 'DELETE' })
    );
    return json.data;
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Orders Module — admin List / View / Update Status / Delete used by the
// Orders tab in StoresTab.jsx. Orders themselves are created by the
// storefront checkout flow, not here.
// ─────────────────────────────────────────────────────────────────────────
export const ORDER_STATUSES = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];

export const orderApi = {
  list: async (storeId, { status, search } = {}) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const json = unwrap(await requestJson(`/store/${storeId}/admin/orders${qs}`));
    return json.data;
  },

  get: async (storeId, id) => {
    const json = unwrap(await requestJson(`/store/${storeId}/admin/orders/${id}`));
    return json.data;
  },

  updateStatus: async (storeId, id, status) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/orders/${id}/status`, {
        method: 'PATCH',
        body: { status },
      })
    );
    return json.data;
  },

  remove: async (storeId, id) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/orders/${id}`, { method: 'DELETE' })
    );
    return json.data;
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Products Module — admin CRUD used by the Products tab in StoresTab.jsx.
// Create / Edit / Delete, Images, Inventory, Price, SEO.
// ─────────────────────────────────────────────────────────────────────────
export const productApi = {
  list: async (storeId, { status, search } = {}) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const json = unwrap(await requestJson(`/store/${storeId}/admin/products${qs}`));
    return json.data;
  },

  get: async (storeId, id) => {
    const json = unwrap(await requestJson(`/store/${storeId}/admin/products/${id}`));
    return json.data;
  },

  create: async (storeId, payload) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/products`, { method: 'POST', body: payload })
    );
    return json.data;
  },

  update: async (storeId, id, payload) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/products/${id}`, { method: 'PATCH', body: payload })
    );
    return json.data;
  },

  remove: async (storeId, id) => {
    const json = unwrap(
      await requestJson(`/store/${storeId}/admin/products/${id}`, { method: 'DELETE' })
    );
    return json.data;
  },

  // Uploads a single product image via the shared media library endpoint
  // (same Cloudinary pipeline the page builder's asset manager uses) and
  // returns the resulting hosted URL.
  uploadImage: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE}/website-builder/media/upload`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Image upload failed: ${res.status} ${text}`);
    }
    const json = await res.json();
    if (!json?.success) throw new Error(json?.error || 'Image upload failed');
    return json.data; // { src, name, width, height, id }
  },
};