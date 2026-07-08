import React from 'react';
import { useBestSellers } from '../hooks/useProducts';
import ProductGrid from './ProductGrid';
import SectionHeading from './SectionHeading';

// BestSellers.jsx — renders GET /products/bestsellers via useBestSellers
// (ranked by units sold across completed orders via
// OrderService.getBestSellers, falling back to newest Active products for
// a brand-new store). Reloads on inventory events too, so a sellout
// updates the stock badge here in real time.
export default function BestSellers({ limit = 8 }) {
  const { products, loading, error } = useBestSellers(limit);

  return (
    <section style={{ marginBottom: 40 }}>
      <SectionHeading title="Best Sellers" />
      <ProductGrid products={products} loading={loading} error={error} emptyLabel="No sales yet." />
    </section>
  );
}