import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useStorefront } from '../StorefrontContext';
import { useCollection } from '../hooks/useProducts';
import ProductGrid from '../components/ProductGrid';

// CategoryPage.jsx — a Category/Collection detail page. Fetches the
// collection record plus its live, Active products via one Store Engine
// call (GET /collections/:id) through useCollection — never a client-side
// filter over some already-fetched "all products" list. useCollection
// reloads automatically on collection and product events (a product
// added to/removed from/archived out of this collection), so this page
// never needs a manual refresh either.
export default function CategoryPage({ collectionId }) {
  const { goHome } = useStorefront();
  const { collection: data, loading, error } = useCollection(collectionId);

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1120, margin: '0 auto' }}>
      <span
        role="button"
        tabIndex={0}
        onClick={goHome}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#2563eb', cursor: 'pointer', marginBottom: 20 }}
      >
        <ArrowLeft size={14} /> Back to home
      </span>

      {loading ? (
        <div style={{ color: '#64748b', fontWeight: 600 }}>Loading collection…</div>
      ) : error ? (
        <div style={{ color: '#ef4444', fontWeight: 600 }}>{error}</div>
      ) : (
        <>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{data?.title}</h1>
          {data?.description && <p style={{ color: '#64748b', margin: '0 0 24px' }}>{data.description}</p>}
          <ProductGrid
            products={data?.products}
            loading={false}
            error={null}
            emptyLabel="No products in this collection yet."
          />
        </>
      )}
    </div>
  );
}