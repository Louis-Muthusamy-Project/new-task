import React from 'react';
import { useStorefront } from '../StorefrontContext';
import FeaturedProducts from '../components/FeaturedProducts';
import LatestProducts from '../components/LatestProducts';
import BestSellers from '../components/BestSellers';
import CollectionsGrid from '../components/CollectionsGrid';

// HomePage.jsx — assembles the storefront home screen. Each section below
// (Featured / Latest / Best Sellers / Collections) is fully self-contained
// and fetches its own data — this component passes no product data down,
// it only lays sections out.
export default function HomePage() {
  const { storeInfo } = useStorefront();

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1120, margin: '0 auto' }}>
      <div
        style={{
          borderRadius: 16,
          padding: '48px 32px',
          marginBottom: 40,
          background: 'linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
          {storeInfo?.name || 'Store'}
        </h1>
        {storeInfo?.description && (
          <p style={{ fontSize: 15, color: '#475569', maxWidth: 520, margin: '0 auto' }}>{storeInfo.description}</p>
        )}
      </div>

      <FeaturedProducts />
      <CollectionsGrid />
      <LatestProducts />
      <BestSellers />
    </div>
  );
}
