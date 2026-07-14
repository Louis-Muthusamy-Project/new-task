import React from 'react';
import { useStorefront } from '../StorefrontContext';
import { useStorefrontQuery } from '../hooks/useStorefrontQuery';
import { storefrontApi } from '../../../../api/storefrontApi';

// Footer.jsx — reads storeInfo from context, but fetches Published pages
// itself (independent query from Menu's — a section only shares data it
// truly shares, and owns the data it doesn't).
export default function Footer() {
  const { storeId, storeInfo, goToPage } = useStorefront();
  const { data: pages } = useStorefrontQuery(() => storefrontApi.listPages(storeId), [storeId]);

  return (
    <footer
      style={{
        marginTop: 48,
        borderTop: '1px solid var(--border-color, #e2e8f0)',
        padding: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        background: '#f8fafc',
      }}
    >
      <div style={{ fontSize: 13, color: '#64748b' }}>
        © {new Date().getFullYear()} {storeInfo?.name || 'Store'}. All rights reserved.
      </div>

      {(pages || []).length > 0 && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {pages.map((p) => (
            <span
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => goToPage(p.slug)}
              style={{ fontSize: 12, fontWeight: 600, color: '#334155', cursor: 'pointer' }}
            >
              {p.name}
            </span>
          ))}
        </div>
      )}
    </footer>
  );
}