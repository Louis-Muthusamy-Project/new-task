import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../CartContext';
import { useStorefront } from '../StorefrontContext';

function formatMoney(amount, currency) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(
    amount || 0
  );
}

export default function CartDrawer() {
  const { cart, loading, drawerOpen, closeDrawer, updateItem, removeItem, applyDiscount, removeDiscount } =
    useCart();
  const { currency, goToCheckout } = useStorefront();
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [applying, setApplying] = useState(false);

  if (!drawerOpen) return null;

  const items = cart?.items || [];

  const handleApplyCode = async () => {
    if (!codeInput.trim()) return;
    setApplying(true);
    setCodeError('');
    try {
      await applyDiscount(codeInput.trim());
    } catch (err) {
      setCodeError(err.message || 'Could not apply that code.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
      <div
        onClick={closeDrawer}
        style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)' }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(420px, 100%)',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(15,23,42,0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingBag size={18} /> Your cart
          </span>
          <button
            onClick={closeDrawer}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {loading && !cart ? (
            <div style={{ color: '#64748b', fontWeight: 600, padding: '24px 0' }}>Loading…</div>
          ) : items.length === 0 ? (
            <div style={{ color: '#94a3b8', fontWeight: 600, padding: '32px 0', textAlign: 'center' }}>
              Your cart is empty.
            </div>
          ) : (
            items.map((line) => (
              <div
                key={String(line.productId)}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '14px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    background: '#f8fafc',
                    flexShrink: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {line.image ? (
                    <img src={line.image} alt={line.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>No image</span>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{line.title}</div>
                  {!line.available && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', marginTop: 2 }}>
                      No longer available
                    </div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                    {formatMoney(line.price, line.currency || currency)}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <button
                      onClick={() => updateItem(line.productId, Math.max(0, line.quantity - 1))}
                      style={qtyBtnStyle}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ fontSize: 13, fontWeight: 700, minWidth: 18, textAlign: 'center' }}>
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => updateItem(line.productId, line.quantity + 1)}
                      style={qtyBtnStyle}
                      disabled={line.maxQuantity != null && line.quantity >= line.maxQuantity}
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      onClick={() => removeItem(line.productId)}
                      style={{ ...qtyBtnStyle, marginLeft: 'auto', color: '#ef4444', borderColor: '#fecaca' }}
                      aria-label="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div style={{ borderTop: '1px solid #e2e8f0', padding: '16px 20px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Discount code"
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                }}
              />
              <button
                onClick={handleApplyCode}
                disabled={applying}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px solid #0f172a',
                  background: '#fff',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Apply
              </button>
            </div>
            {codeError && <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 8 }}>{codeError}</div>}
            {cart?.discount?.valid && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#059669', fontWeight: 700, marginBottom: 8 }}>
                <span>Code {cart.discount.code} applied</span>
                <button onClick={removeDiscount} style={{ background: 'none', border: 'none', color: '#059669', textDecoration: 'underline', cursor: 'pointer', fontSize: 12 }}>
                  Remove
                </button>
              </div>
            )}
            {cart?.discount && cart.discount.valid === false && (
              <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 8 }}>{cart.discount.reason}</div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '8px 0 16px' }}>
              <span>Subtotal</span>
              <span>{formatMoney(cart?.subtotal, currency)}</span>
            </div>

            <button
              onClick={() => {
                closeDrawer();
                goToCheckout();
              }}
              disabled={cart?.hasUnavailableItems}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: 'none',
                background: cart?.hasUnavailableItems ? '#cbd5e1' : '#0f172a',
                color: '#fff',
                fontWeight: 800,
                fontSize: 14,
                cursor: cart?.hasUnavailableItems ? 'not-allowed' : 'pointer',
              }}
            >
              Checkout
            </button>
            {cart?.hasUnavailableItems && (
              <div style={{ color: '#ef4444', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
                Remove unavailable items to continue.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const qtyBtnStyle = {
  width: 26,
  height: 26,
  borderRadius: 6,
  border: '1px solid #e2e8f0',
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#0f172a',
};
