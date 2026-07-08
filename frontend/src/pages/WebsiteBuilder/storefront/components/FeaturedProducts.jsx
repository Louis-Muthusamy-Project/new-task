import React from 'react';
import { useFeaturedProducts } from '../hooks/useProducts';
import ProductGrid from './ProductGrid';
import SectionHeading from './SectionHeading';

// FeaturedProducts.jsx — renders GET /products/featured via useFeaturedProducts
// (merchant curated via the `featured` tag on ProductService, falling back
// to the newest Active products). The hook itself subscribes to the
// store's real-time event stream, so a product added or tagged in Admin
// shows up here the instant the event arrives — no polling, no manual
// refresh, and no other section needs to change for this one to update.
export default function FeaturedProducts({ limit = 8 }) {
  const { products, loading, error } = useFeaturedProducts(limit);

  return (
    <section style={{ marginBottom: 40 }}>
      <SectionHeading title="Featured Products" />
      <ProductGrid products={products} loading={loading} error={error} emptyLabel="No featured products yet." />
    </section>
  );
}