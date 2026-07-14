import React from 'react';
import { useStorefront } from '../StorefrontContext';
import { useStorefrontQuery } from '../hooks/useStorefrontQuery';
import { useCollections } from '../hooks/useProducts';
import { storefrontApi } from '../../../../api/storefrontApi';

// Menu.jsx — the storefront's nav bar. Every link is derived from real
// data fetched here: Published StorePage documents (via
// PageService.listPublicPages) for custom pages, plus live Collections
// (via useCollections, which reacts to the store's real-time event
// stream) for the "Shop" dropdown. Nothing in this list is hardcoded — a
// page a merchant publishes, or a collection they create, appears the
// moment the corresponding event arrives, no refetch timer required.
export default function Menu() {
  const { storeId, goHome, goToCollection, goToPage } = useStorefront();

  const { data: pages } = useStorefrontQuery(() => storefrontApi.listPages(storeId), [storeId]);
  const { collections } = useCollections(8);

  const customPages = (pages || []).filter((p) => !p.isHome);

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <span
        role="button"
        tabIndex={0}
        onClick={goHome}
        style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}
      >
        Home
      </span>

      {(collections || []).length > 0 && (
        <div style={{ position: 'relative' }} className="storefront-menu-shop">
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', cursor: 'default' }}>Shop</span>
          <div
            className="storefront-menu-shop-dropdown"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              display: 'none',
              flexDirection: 'column',
              background: '#fff',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: 8,
              minWidth: 160,
              boxShadow: '0 8px 24px rgba(15,23,42,0.10)',
              zIndex: 10,
              padding: 6,
            }}
          >
            {collections.map((c) => (
              <span
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => goToCollection(c.id)}
                style={{ fontSize: 13, fontWeight: 600, color: '#334155', padding: '6px 8px', cursor: 'pointer', borderRadius: 6 }}
              >
                {c.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {customPages.map((p) => (
        <span
          key={p.id}
          role="button"
          tabIndex={0}
          onClick={() => goToPage(p.slug)}
          style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}
        >
          {p.name}
        </span>
      ))}

      <style>{`
        .storefront-menu-shop:hover .storefront-menu-shop-dropdown { display: flex; }
        .storefront-menu-shop-dropdown span:hover { background: #f1f5f9; }
      `}</style>
    </nav>
  );
}