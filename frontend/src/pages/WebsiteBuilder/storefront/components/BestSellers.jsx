import React from 'react';
import { useStorefront } from '../StorefrontContext';
import { useStorefrontQuery } from '../hooks/useStorefrontQuery';
import { storefrontApi } from '../../../../api/storefrontApi';
import ProductGrid from './ProductGrid';
import SectionHeading from './SectionHeading';

// BestSellers.jsx — fetches GET /products/bestsellers itself (ranked by
// units sold across completed orders via OrderService.getBestSellers,
// falling back to newest Active products for a brand-new store).
export default function BestSellers({ limit = 8 }) {
  const { storeId } = useStorefront();
  const { data, loading, error } = useStorefrontQuery(
    () => storefrontApi.listBestSellers(storeId, limit),
    [storeId, limit]
  );

  return (
    <section style={{ marginBottom: 40 }}>
      <SectionHeading title="Best Sellers" />
      <ProductGrid products={data} loading={loading} error={error} emptyLabel="No sales yet." />
    </section>
  );
}
