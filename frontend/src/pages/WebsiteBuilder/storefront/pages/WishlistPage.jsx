import React from 'react';
import { ArrowLeft, Heart } from 'lucide-react';
import { useStorefront } from '../StorefrontContext';
import { useWishlistProducts } from '../hooks/useWishlist';
import ProductGrid from '../components/ProductGrid';

// WishlistPage.jsx — the generic (non-themed) fallback for the Wishlist
// view, same role CategoryPage/SearchResultsPage play for their routes:
// rendered whenever the active theme has no `wishlist` block on this
// route (see StorefrontApp.jsx's useThemedPage). Reuses the same
// ProductGrid every other product listing on the storefront renders into
// — a saved item's "Add to cart" button is the exact same ProductCard
// control, wired to the same CartContext, no separate add-to-cart path.
export default function WishlistPage() {
  const { goHome } = useStorefront();
  const { products, loading, error } = useWishlistProducts();

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1120, margin: '0 auto' }}>
      <span
        role="button"
        tabIndex={0}
        onClick={goHome}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#2563eb', cursor: 'pointer', marginBottom: 20 }}
      >
        <ArrowLeft size={14} /> Continue shopping
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <Heart size={22} />
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>Your Wishlist</h1>
      </div>

      <ProductGrid products={products} loading={loading} error={error} emptyLabel="Nothing saved yet." />
    </div>
  );
}
