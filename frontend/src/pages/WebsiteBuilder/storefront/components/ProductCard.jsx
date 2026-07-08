import React from 'react';
import { useStorefront } from '../StorefrontContext';

// ProductCard.jsx — the single card renderer for a product. Featured
// Products, Latest Products, Best Sellers, Category pages, and Search
// results all render this same component instead of each defining its
// own card markup.
export default function ProductCard({ product }) {
  const { currency, goToProduct } = useStorefront();

  if (!product) return null;

  const price = new Intl.NumberFormat(undefined, { style: 'currency', currency: product.currency || currency }).format(
    product.price || 0
  );
  const compareAt =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? new Intl.NumberFormat(undefined, { style: 'currency', currency: product.currency || currency }).format(
          product.compareAtPrice
        )
      : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => goToProduct(product.id)}
      onKeyDown={(e) => e.key === 'Enter' && goToProduct(product.id)}
      style={{
        cursor: 'pointer',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.15s ease, transform 0.15s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,0.08)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div
        style={{
          aspectRatio: '1 / 1',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {product.image ? (
          <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>No image</span>
        )}
      </div>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{product.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{price}</span>
          {compareAt && (
            <span style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'line-through' }}>{compareAt}</span>
          )}
        </div>
        {!product.inStock && (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444' }}>Out of stock</span>
        )}
      </div>
    </div>
  );
}
