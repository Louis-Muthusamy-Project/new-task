import React from 'react';
import { useStorefront } from '../StorefrontContext';
import { useCollections } from '../hooks/useProducts';
import SectionHeading from './SectionHeading';

// CollectionsGrid.jsx — renders GET /collections via useCollections. Powers
// both the "Shop by Collection" homepage section and the Menu's category
// dropdown (Menu re-uses the data via its own fetch, not a prop, to keep
// each component independently responsible for its own API call).
// useCollections reloads on both collection events (created/renamed/
// deleted) and product events (a collection's productCount changes as
// products are added/removed/archived) — so this grid never needs a
// manual refresh either way.
export default function CollectionsGrid({ limit = 8 }) {
  const { goToCollection } = useStorefront();
  const { collections: data, loading, error } = useCollections(limit);

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