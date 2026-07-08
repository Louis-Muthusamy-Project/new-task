import React, { useState } from 'react';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { useStorefront } from '../StorefrontContext';
import { useCart } from '../CartContext';
import { useProduct } from '../hooks/useProducts';

// ProductPage.jsx — a single Product Page. Fetches this one product by id
// via useProduct (GET /products/:productId), which subscribes to the
// store's real-time event stream — so editing a product, restocking it,
// or a concurrent checkout decrementing its inventory in Admin is
// reflected here immediately, on an already-open page, with no reload.
export default function ProductPage({ productId }) {
  const { currency, goHome } = useStorefront();
  const { product, loading, error } = useProduct(productId);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const price = product
    ? new Intl.NumberFormat(undefined, { style: 'currency', currency: product.currency || currency }).format(
        product.price || 0
      )
    : null;

  const handleAddToCart = async () => {
    if (!product?.inStock || adding) return;
    setAdding(true);
    try {
      await addItem(product.id, quantity);
    } finally {
      setAdding(false);
    }
  };

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

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  style={qtyBtnStyle}
                >
                  <Minus size={13} />
                </button>
                <span style={{ minWidth: 28, textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  style={qtyBtnStyle}
                >
                  <Plus size={13} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || adding}
                style={{
                  flex: 1,
                  padding: '11px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: product.inStock ? '#0f172a' : '#e2e8f0',
                  color: product.inStock ? '#fff' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: product.inStock ? 'pointer' : 'not-allowed',
                }}
              >
                {adding ? 'Adding…' : product.inStock ? 'Add to cart' : 'Out of stock'}
              </button>
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

const qtyBtnStyle = {
  width: 32,
  height: 32,
  border: 'none',
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#0f172a',
};