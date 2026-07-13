import React, { useState } from 'react';
import { Plus, Heart } from 'lucide-react';
import { useStorefront } from '../StorefrontContext';
import { useCart } from '../CartContext';
import { useWishlist } from '../hooks/useWishlist';

// ProductCard.jsx — the single card renderer for a product. Featured
// Products, Latest Products, Best Sellers, Category pages, Search
// results, and the Wishlist page all render this same component instead
// of each defining its own card markup.
export default function ProductCard({ product }) {
  const { currency, goToProduct } = useStorefront();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const [adding, setAdding] = useState(false);

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

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!product.inStock || adding) return;
    setAdding(true);
    try {
      await addItem(product.id, 1);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    toggle(product.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => goToProduct(product.slug)}
      onKeyDown={(e) => e.key === 'Enter' && goToProduct(product.slug)}
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
          position: 'relative',
          aspectRatio: '1 / 1',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={handleToggleWishlist}
          aria-label={has(product.id) ? 'Remove from wishlist' : 'Save to wishlist'}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            width: 28,
            height: 28,
            borderRadius: 999,
            border: 'none',
            background: 'rgba(255,255,255,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Heart size={14} color={has(product.id) ? '#ef4444' : '#0f172a'} fill={has(product.id) ? '#ef4444' : 'none'} />
        </button>
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

        <button
          onClick={handleAddToCart}
          disabled={!product.inStock || adding}
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px 10px',
            borderRadius: 8,
            border: '1px solid #0f172a',
            background: product.inStock ? '#0f172a' : '#e2e8f0',
            color: product.inStock ? '#fff' : '#94a3b8',
            fontSize: 12,
            fontWeight: 700,
            cursor: product.inStock ? 'pointer' : 'not-allowed',
          }}
        >
          <Plus size={13} /> {adding ? 'Adding…' : 'Add to cart'}
        </button>
      </div>
    </div>
  );
}