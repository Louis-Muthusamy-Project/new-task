import React from 'react';
import ProductCard from './ProductCard';

// ProductGrid.jsx — the single grid layout every product-listing section
// (Featured, Latest, Best Sellers, Category, Search) renders its items
// into. `emptyLabel` lets each caller give a section-appropriate empty
// message without duplicating the grid/empty-state markup itself.
export default function ProductGrid({ products, loading, error, emptyLabel = 'No products yet.' }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0', color: '#64748b', fontWeight: 600 }}>
        Loading products…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0', color: '#ef4444', fontWeight: 600 }}>
        {error}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0', color: '#94a3b8', fontWeight: 600 }}>
        {emptyLabel}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 16,
      }}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
