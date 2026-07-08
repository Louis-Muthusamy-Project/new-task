import React from 'react';
import { useStorefront } from '../StorefrontContext';
import { useStorefrontQuery } from '../hooks/useStorefrontQuery';
import { storefrontApi } from '../../../../api/storefrontApi';
import ProductGrid from './ProductGrid';
import SectionHeading from './SectionHeading';

// FeaturedProducts.jsx — fetches GET /products/featured itself (merchant
// curated via the `featured` tag on ProductService, falling back to the
// newest Active products). Never receives products as a prop from a
// parent "page data" blob — this is its own API call, so a product added
// or tagged in Admin shows up here without any other section changing.
export default function FeaturedProducts({ limit = 8 }) {
  const { storeId } = useStorefront();
  const { data, loading, error } = useStorefrontQuery(
    () => storefrontApi.listFeaturedProducts(storeId, limit),
    [storeId, limit]
  );

  return (
    <section style={{ marginBottom: 40 }}>
      <SectionHeading title="Featured Products" />
      <ProductGrid products={data} loading={loading} error={error} emptyLabel="No featured products yet." />
    </section>
  );
}
