import React from 'react';
import { useLatestProducts } from '../hooks/useProducts';
import ProductGrid from './ProductGrid';
import SectionHeading from './SectionHeading';

// LatestProducts.jsx — renders GET /products/latest via useLatestProducts.
// This is the section that most directly proves the "add a product in
// Admin, see it in Preview" requirement: newest-first from the live
// StoreProduct collection, and the hook reloads the instant the backend's
// event stream reports a `product.created`/`product.updated` — no
// snapshot, no manual refresh.
export default function LatestProducts({ limit = 8 }) {
  const { products, loading, error } = useLatestProducts(limit);

  return (
    <section style={{ marginBottom: 40 }}>
      <SectionHeading title="Latest Products" />
      <ProductGrid products={products} loading={loading} error={error} emptyLabel="No products yet." />
    </section>
  );
}