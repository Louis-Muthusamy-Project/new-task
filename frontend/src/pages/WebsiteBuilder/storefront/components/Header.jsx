import React from 'react';
import { ShoppingBag, User, Heart } from 'lucide-react';
import { useStorefront } from '../StorefrontContext';
import { useCart } from '../CartContext';
import { useWishlistContext } from '../WishlistContext';
import Menu from './Menu';
import SearchBar from './SearchBar';

// Header.jsx — reads storeInfo from StorefrontContext (fetched once,
// centrally) rather than fetching its own copy of the store record.
// Also surfaces the persisted cart (item count + open-drawer), the
// persisted wishlist (item count + goToWishlist), and the storefront
// account state (sign in / signed-in name) — all from their own
// contexts, never local state here.
export default function Header() {
  const { storeInfo, storeInfoLoading, goHome, goToWishlist } = useStorefront();
  const { itemCount, openDrawer, isSignedIn, customer, openAuth, logout } = useCart();
  const { itemCount: wishlistCount } = useWishlistContext();

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

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <SearchBar />

        <button
          onClick={isSignedIn ? logout : openAuth}
          title={isSignedIn ? `Sign out (${customer?.firstName || customer?.email})` : 'Sign in'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: '#0f172a',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <User size={18} />
          <span style={{ display: 'none' }}>{isSignedIn ? customer?.firstName || 'Account' : 'Sign in'}</span>
        </button>

        <button
          onClick={goToWishlist}
          aria-label="Open wishlist"
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Heart size={18} />
          {wishlistCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -6,
                right: -8,
                background: '#0f172a',
                color: '#fff',
                fontSize: 10,
                fontWeight: 800,
                borderRadius: 999,
                minWidth: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
              }}
            >
              {wishlistCount}
            </span>
          )}
        </button>

        <button
          onClick={openDrawer}
          aria-label="Open cart"
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ShoppingBag size={20} />
          {itemCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -6,
                right: -8,
                background: '#0f172a',
                color: '#fff',
                fontSize: 10,
                fontWeight: 800,
                borderRadius: 999,
                minWidth: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
              }}
            >
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}