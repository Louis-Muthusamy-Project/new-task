import React from 'react';
import { useStorefront } from '../StorefrontContext';
import { useStorefrontQuery } from '../hooks/useStorefrontQuery';
import { storefrontApi } from '../../../../api/storefrontApi';
import SectionHeading from './SectionHeading';

// CollectionsGrid.jsx — fetches GET /collections itself. Powers both the
// "Shop by Collection" homepage section and the Menu's category dropdown
// (Menu re-uses the data via its own fetch, not a prop, to keep each
// component independently responsible for its own API call).
export default function CollectionsGrid({ limit = 8 }) {
  const { storeId, goToCollection } = useStorefront();
  const { data, loading, error } = useStorefrontQuery(
    () => storefrontApi.listCollections(storeId, { limit }),
    [storeId, limit]
  );

  return (
    <section style={{ marginBottom: 40 }}>
      <SectionHeading title="Shop by Collection" />

      {loading ? (
        <div style={{ color: '#64748b', fontWeight: 600 }}>Loading collections…</div>
      ) : error ? (
        <div style={{ color: '#ef4444', fontWeight: 600 }}>{error}</div>
      ) : !data || data.length === 0 ? (
        <div style={{ color: '#94a3b8', fontWeight: 600 }}>No collections yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          {data.map((c) => (
            <div
              key={c.id}
              role="button"
              tabIndex={0}
              onClick={() => goToCollection(c.id)}
              onKeyDown={(e) => e.key === 'Enter' && goToCollection(c.id)}
              style={{
                cursor: 'pointer',
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid var(--border-color, #e2e8f0)',
                background: '#fff',
              }}
            >
              <div style={{ aspectRatio: '4 / 3', background: '#f1f5f9', overflow: 'hidden' }}>
                {c.imageUrl && (
                  <img src={c.imageUrl} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{c.title}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{c.productCount} products</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
