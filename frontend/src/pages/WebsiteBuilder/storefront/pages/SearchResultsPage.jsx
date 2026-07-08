import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useStorefront } from '../StorefrontContext';
import { useSearch } from '../hooks/useProducts';
import ProductGrid from '../components/ProductGrid';

// SearchResultsPage.jsx — the Search section's results view. Fetches
// GET /search itself (via useSearch); SearchBar only supplies the query
// string via navigation, never the results. useSearch reloads on both
// product and collection events, so a newly created/edited product or
// collection that matches an already-open query appears without the
// shopper re-submitting the search.
export default function SearchResultsPage({ q }) {
  const { goHome, goToCollection } = useStorefront();
  const { products, collections, loading, error } = useSearch(q);

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

      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 20px' }}>
        Search results for "{q}"
      </h1>

      {loading ? (
        <div style={{ color: '#64748b', fontWeight: 600 }}>Searching…</div>
      ) : error ? (
        <div style={{ color: '#ef4444', fontWeight: 600 }}>{error}</div>
      ) : (
        <>
          {collections?.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Collections</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {collections.map((c) => (
                  <span
                    key={c.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => goToCollection(c.id)}
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#334155',
                      background: '#f1f5f9',
                      padding: '8px 12px',
                      borderRadius: 999,
                      cursor: 'pointer',
                    }}
                  >
                    {c.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Products</h3>
          <ProductGrid products={products} loading={false} error={null} emptyLabel="No products matched your search." />
        </>
      )}
    </div>
  );
}