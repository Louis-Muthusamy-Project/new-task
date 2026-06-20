// Intentionally disabled: frontend must not call backend APIs.
// This module used to wrap fetch() calls to the website-builder backend.
// Keep a stable export surface if other parts of the app import it.

const disabled = () => {
  throw new Error('websiteBuilderApi is disabled in this frontend (no API connections).');
};

export const websiteBuilderApi = {
  listWebsites: disabled,
  createWebsite: disabled,
  updateWebsite: disabled,
  deleteWebsite: disabled,

  listFunnels: disabled,
  createFunnel: disabled,
  updateFunnel: disabled,
  deleteFunnel: disabled,

  listStores: disabled,
  createStore: disabled,
  updateStore: disabled,
  deleteStore: disabled,

  listDomains: disabled,
  createDomain: disabled,
  updateDomain: disabled,
  deleteDomain: disabled,

  listChatWidgets: disabled,
  createChatWidget: disabled,
  updateChatWidget: disabled,
  deleteChatWidget: disabled,

  listQrs: disabled,
  createQr: disabled,
  deleteQr: disabled,

  listForms: disabled,
  createForm: disabled,
  updateForm: disabled,
  deleteForm: disabled,

  listBlogs: disabled,
  createBlog: disabled,
  updateBlog: disabled,
  deleteBlog: disabled,
};

