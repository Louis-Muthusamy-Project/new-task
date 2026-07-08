import React from 'react';
import { useStorefront } from '../StorefrontContext';
import Menu from './Menu';
import SearchBar from './SearchBar';

// Header.jsx — reads storeInfo from StorefrontContext (fetched once,
// centrally) rather than fetching its own copy of the store record.
export default function Header() {
  const { storeInfo, storeInfoLoading, goHome } = useStorefront();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '14px 24px',
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        background: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={goHome}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
      >
        {storeInfo?.logoUrl && (
          <img src={storeInfo.logoUrl} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
        )}
        <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
          {storeInfoLoading ? 'Loading…' : storeInfo?.name || 'Store'}
        </span>
      </div>

      <Menu />

      <SearchBar />
    </header>
  );
}
