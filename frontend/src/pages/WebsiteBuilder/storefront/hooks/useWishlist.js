import { useWishlistContext } from '../WishlistContext';

// useWishlist.js — the data layer behind the `wishlist` / `wishlist-button`
// store blocks (see ThemeRenderer.jsx). Backed by a real, persisted
// StoreWishlist document (wishlistService.js / wishlistController.js) via
// WishlistContext, the same way useCart() is backed by CartContext and a
// real StoreCart — a wishlist item now survives a reload, a different
// device, or a different browser tab the moment a shopper is signed in,
// and merges into their account at login exactly like cart items do.
//
// Every block that already consumes useWishlist()/useWishlistProducts()
// keeps working unchanged — this file keeps the same exported shapes
// { ids, has, toggle } / { products, loading, error, reload } that the
// former client-only (localStorage) implementation had.

/** useWishlist() — the saved-product-id set for the current store. */
export function useWishlist() {
  const { ids, has, toggle } = useWishlistContext();
  return { ids, has, toggle };
}

/** useWishlistProducts() — the Wishlist page's data: full product records for every saved id. */
export function useWishlistProducts() {
  const { items, loading, error, refreshWishlist } = useWishlistContext();

  // Re-shaped to the { id, title, price, currency, image, slug, inStock }
  // contract ProductCard/ProductGrid already expect from useProducts() —
  // WishlistService intentionally returns `productId` (it's the id of a
  // StoreProduct, not a wishlist-line id), mapped to `id` here so this
  // stays a drop-in replacement for the grid components.
  const products = (items || []).map((item) => ({
    id: String(item.productId),
    title: item.title,
    price: item.price,
    currency: item.currency,
    image: item.image,
    slug: item.slug,
    inStock: item.inStock,
  }));

  return { products, loading, error, reload: refreshWishlist };
}