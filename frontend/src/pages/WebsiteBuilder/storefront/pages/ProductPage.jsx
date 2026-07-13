import React, { useEffect, useState } from 'react';
import { ArrowLeft, ChevronRight, Minus, Plus, Star } from 'lucide-react';
import { useStorefront } from '../StorefrontContext';
import { useCart } from '../CartContext';
import { useProductBySlug, useProductReviews } from '../hooks/useProducts';
import { storefrontApi } from '../../../../api/storefrontApi';
import ProductGrid from '../components/ProductGrid';

// ProductPage.jsx — the Product Detail Page, addressed by the
// shopper-facing `/products/:slug` identifier. Everything shown here
// (name, gallery, price, description, stock, rating, reviews, category,
// related products, SEO) comes from a single read of the Store Product
// collection (GET /products/slug/:slug, see useProductBySlug) plus one
// read of the existing Testimonial-backed reviews endpoint — no separate
// storage for any of it. Reloads on the same real-time product/inventory
// events every other storefront surface does, so an admin edit or a
// concurrent checkout decrementing stock shows up here without a reload.
export default function ProductPage({ slug }) {
  const { currency, goHome, goToCollection, storeId, setViewedProduct } = useStorefront();
  const { product, loading, error } = useProductBySlug(slug);
  const { reviews, loading: reviewsLoading } = useProductReviews(product?.id);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Reset the gallery/quantity selection whenever a shopper lands on a
  // different product, and hand the resolved product off to context so
  // DOM-level block hydration (e.g. a themed page's wishlist-button)
  // knows which product is current even though navigation itself is
  // slug-based.
  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    setViewedProduct(product || null);
    return () => setViewedProduct(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  // SEO — document title + meta description, sourced from the product's
  // own `seo` fields (falling back to title/description), so a shared or
  // bookmarked /products/:slug link previews correctly.
  useEffect(() => {
    if (!product) return undefined;
    const previousTitle = document.title;
    document.title = product.seo?.metaTitle || product.title;

    let meta = document.querySelector('meta[name="description"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    const previousContent = meta.getAttribute('content');
    meta.setAttribute('content', product.seo?.metaDescription || product.description || '');

    return () => {
      document.title = previousTitle;
      if (created) {
        meta.remove();
      } else if (previousContent != null) {
        meta.setAttribute('content', previousContent);
      }
    };
  }, [product]);

  // Funnel analytics — fired once the slug has actually resolved to a
  // real product, so the event always carries a real productId.
  useEffect(() => {
    if (product?.id) {
      storefrontApi.trackEvent(storeId, 'product_view', { productId: product.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, product?.id]);

  const fmt = (amount) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency: product?.currency || currency }).format(
      amount || 0
    );

  const price = product ? fmt(product.price) : null;
  const compareAtPrice =
    product?.compareAtPrice && product.compareAtPrice > product.price ? fmt(product.compareAtPrice) : null;

  const handleAddToCart = async () => {
    if (!product?.inStock || adding) return;
    setAdding(true);
    try {
      await addItem(product.id, quantity);
    } finally {
      setAdding(false);
    }
  };

  const images = product?.images?.length ? product.images : [];
  const rating = product?.rating || 0;
  const reviewCount = product?.reviewCount || 0;

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1120, margin: '0 auto' }}>
      {/* Breadcrumb — Home > Category > Product Name. Category is only
          shown when the product actually belongs to one; Home is always
          the anchor since a Product Page can be reached directly. */}
      <nav
        aria-label="Breadcrumb"
        style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 20 }}
      >
        <span role="button" tabIndex={0} onClick={goHome} style={{ cursor: 'pointer', color: '#2563eb' }}>
          Home
        </span>
        {product?.categories?.[0] && (
          <>
            <ChevronRight size={13} />
            <span
              role="button"
              tabIndex={0}
              onClick={() => goToCollection(product.categories[0].id)}
              style={{ cursor: 'pointer', color: '#2563eb' }}
            >
              {product.categories[0].title}
            </span>
          </>
        )}
        {product && (
          <>
            <ChevronRight size={13} />
            <span style={{ color: '#0f172a' }}>{product.title}</span>
          </>
        )}
      </nav>

      <span
        role="button"
        tabIndex={0}
        onClick={goHome}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#2563eb', cursor: 'pointer', marginBottom: 20 }}
      >
        <ArrowLeft size={14} /> Back to home
      </span>

      {loading ? (
        <div style={{ color: '#64748b', fontWeight: 600 }}>Loading product…</div>
      ) : error ? (
        <div style={{ color: '#ef4444', fontWeight: 600 }}>{error}</div>
      ) : !product ? (
        <div style={{ color: '#94a3b8', fontWeight: 600 }}>Product not found.</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 32 }}>
            {/* Gallery */}
            <div>
              <div
                style={{
                  aspectRatio: '1 / 1',
                  background: '#f8fafc',
                  borderRadius: 16,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {images[activeImage] ? (
                  <img
                    src={images[activeImage]}
                    alt={product.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>No image</span>
                )}
              </div>
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {images.map((src, i) => (
                    <button
                      key={src + i}
                      onClick={() => setActiveImage(i)}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 8,
                        overflow: 'hidden',
                        padding: 0,
                        background: '#f8fafc',
                        border: i === activeImage ? '2px solid #0f172a' : '2px solid transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>{product.title}</h1>

              {/* Rating */}
              {reviewCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={15}
                        fill={n <= Math.round(rating) ? '#f59e0b' : 'none'}
                        color={n <= Math.round(rating) ? '#f59e0b' : '#cbd5e1'}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{rating.toFixed(1)}</span>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>
                    ({reviewCount} review{reviewCount === 1 ? '' : 's'})
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{price}</span>
                {compareAtPrice && (
                  <span style={{ fontSize: 15, color: '#94a3b8', textDecoration: 'line-through' }}>{compareAtPrice}</span>
                )}
              </div>

              {/* Category chips */}
              {product.categories?.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  {product.categories.map((cat) => (
                    <span
                      key={cat.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => goToCollection(cat.id)}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#2563eb',
                        background: '#eff6ff',
                        padding: '4px 10px',
                        borderRadius: 999,
                        cursor: 'pointer',
                      }}
                    >
                      {cat.title}
                    </span>
                  ))}
                </div>
              )}

              {/* Stock */}
              <div
                style={{
                  display: 'inline-flex',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 999,
                  marginBottom: 20,
                  background: product.inStock ? '#ecfdf5' : '#fef2f2',
                  color: product.inStock ? '#059669' : '#ef4444',
                }}
              >
                {product.inStock
                  ? product.trackInventory && product.stockQuantity != null
                    ? `In stock — ${product.stockQuantity} available`
                    : 'In stock'
                  : 'Out of stock'}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    style={qtyBtnStyle}
                  >
                    <Minus size={13} />
                  </button>
                  <span style={{ minWidth: 28, textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                    style={qtyBtnStyle}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || adding}
                  style={{
                    flex: 1,
                    padding: '11px 18px',
                    borderRadius: 8,
                    border: 'none',
                    background: product.inStock ? '#0f172a' : '#e2e8f0',
                    color: product.inStock ? '#fff' : '#94a3b8',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: product.inStock ? 'pointer' : 'not-allowed',
                  }}
                >
                  {adding ? 'Adding…' : product.inStock ? 'Add to cart' : 'Out of stock'}
                </button>
              </div>

              {/* Description */}
              {product.description && (
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#475569', whiteSpace: 'pre-wrap' }}>
                  {product.description}
                </p>
              )}

              {product.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                  {product.tags.map((t) => (
                    <span
                      key={t}
                      style={{ fontSize: 11, fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '4px 8px', borderRadius: 999 }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          <section style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
              Reviews {reviewCount > 0 && `(${reviewCount})`}
            </h2>
            {reviewsLoading ? (
              <div style={{ color: '#64748b', fontWeight: 600 }}>Loading reviews…</div>
            ) : reviews.length === 0 ? (
              <div style={{ color: '#94a3b8', fontWeight: 600 }}>No reviews yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reviews.map((review) => (
                  <div key={review.id} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ display: 'flex', gap: 1 }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            size={13}
                            fill={n <= review.rating ? '#f59e0b' : 'none'}
                            color={n <= review.rating ? '#f59e0b' : '#cbd5e1'}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{review.customerName}</span>
                      {review.customerTitle && (
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>· {review.customerTitle}</span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: '#475569', margin: 0 }}>{review.quote}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Related Products */}
          {product.relatedProducts?.length > 0 && (
            <section style={{ marginTop: 48 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Related products</h2>
              <ProductGrid products={product.relatedProducts} loading={false} error={null} />
            </section>
          )}
        </>
      )}
    </div>
  );
}

const qtyBtnStyle = {
  width: 32,
  height: 32,
  border: 'none',
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#0f172a',
};