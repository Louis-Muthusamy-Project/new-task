import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useStorefront } from '../StorefrontContext';
import { useStorefrontQuery } from '../hooks/useStorefrontQuery';
import { storefrontApi } from '../../../../api/storefrontApi';
import ProductGrid from '../components/ProductGrid';

// CategoryPage.jsx — a Category/Collection detail page. Fetches the
// collection record plus its live, Active products via one Store Engine
// call (GET /collections/:id) — never a client-side filter over some
// already-fetched "all products" list.
export default function CategoryPage({ collectionId }) {
  const { storeId, goHome } = useStorefront();
  const { data, loading, error } = useStorefrontQuery(
    () => storefrontApi.getCollection(storeId, collectionId),
    [storeId, collectionId]
  );

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
