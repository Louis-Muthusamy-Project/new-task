import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useStorefront } from '../StorefrontContext';
import { useStorefrontQuery } from '../hooks/useStorefrontQuery';
import { storefrontApi } from '../../../../api/storefrontApi';

// ProductPage.jsx — a single Product Page. Fetches this one product by id
// directly from the Store Engine (GET /products/:productId) every time
// it's opened, so editing or restocking a product in Admin is reflected
// the next time a shopper opens this page — never a cached snapshot from
// whatever list they clicked through from.
export default function ProductPage({ productId }) {
  const { storeId, currency, goHome } = useStorefront();
  const { data: product, loading, error } = useStorefrontQuery(
    () => storefrontApi.getProduct(storeId, productId),
    [storeId, productId]
  );

  const price = product
    ? new Intl.NumberFormat(undefined, { style: 'currency', currency: product.currency || currency }).format(
        product.price || 0
      )
    : null;

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto' }}>
      <span
        role="button"
        tabIndex={0}
        onClick={goHome}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#2563eb', cursor: 'pointer', marginBottom: 20 }}
      >
        <ArrowLeft size={14} /> Back to home
      </span>

      {loading ? (
        <div style={{ color: '#64748b', fontWeight: 600 }}>Loading product…</div>
      ) : error ? (
        <div style={{ color: '#ef4444', fontWeight: 600 }}>{error}</div>
      ) : !product ? (
        <div style={{ color: '#94a3b8', fontWeight: 600 }}>Product not found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 32 }}>
          <div
            style={{
              aspectRatio: '1 / 1',
              background: '#f8fafc',
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {product.image ? (
              <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>No image</span>
            )}
          </div>

          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>{product.title}</h1>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>{price}</div>
            <div
              style={{
                display: 'inline-flex',
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 999,
                marginBottom: 20,
                background: product.inStock ? '#ecfdf5' : '#fef2f2',
                color: product.inStock ? '#059669' : '#ef4444',
              }}
            >
              {product.inStock ? 'In stock' : 'Out of stock'}
            </div>
            {product.description && (
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#475569', whiteSpace: 'pre-wrap' }}>
                {product.description}
              </p>
            )}
            {product.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                {product.tags.map((t) => (
                  <span
                    key={t}
                    style={{ fontSize: 11, fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '4px 8px', borderRadius: 999 }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
