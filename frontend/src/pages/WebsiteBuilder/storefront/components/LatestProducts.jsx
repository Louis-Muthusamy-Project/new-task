import React from 'react';
import { useStorefront } from '../StorefrontContext';
import { useStorefrontQuery } from '../hooks/useStorefrontQuery';
import { storefrontApi } from '../../../../api/storefrontApi';
import ProductGrid from './ProductGrid';
import SectionHeading from './SectionHeading';

// LatestProducts.jsx — fetches GET /products/latest itself. This is the
// section that most directly proves the "add a product in Admin, see it
// in Preview" requirement: it's always sorted newest-first from the live
// StoreProduct collection, no snapshot involved.
export default function LatestProducts({ limit = 8 }) {
  const { storeId } = useStorefront();
  const { data, loading, error } = useStorefrontQuery(
    () => storefrontApi.listLatestProducts(storeId, limit),
    [storeId, limit]
  );

  return (
    <section style={{ marginBottom: 40 }}>
      <SectionHeading title="Latest Products" />
      <ProductGrid products={data} loading={loading} error={error} emptyLabel="No products yet." />
    </section>
  );
}
