import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useStorefront } from '../StorefrontContext';

function formatMoney(amount, currency) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(
    amount || 0
  );
}

export default function OrderConfirmationPage({ order }) {
  const { goHome } = useStorefront();

  if (!order) {
    // Someone landed on this view without an order in state (e.g. a
    // refresh) — there's nothing to show, send them back rather than
    // rendering a confusing blank confirmation.
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ color: '#94a3b8', fontWeight: 700, marginBottom: 16 }}>
          We couldn't find that order.
        </div>
        <button onClick={goHome} style={primaryBtnStyle}>
          Continue shopping
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '48px 24px', maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
      <CheckCircle2 size={56} color="#059669" style={{ marginBottom: 16 }} />
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
        Thank you for your order!
      </h1>
      <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 28px' }}>
        A confirmation has been recorded for order <strong>{order.orderNumber}</strong>.
        {order.paymentStatus === 'Pending'
          ? ' Pay when your order is delivered.'
          : ' Your payment has been received.'}
      </p>

      <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, textAlign: 'left' }}>
        <Row label="Order number" value={order.orderNumber} />
        <Row label="Subtotal" value={formatMoney(order.subtotal, order.currency)} />
        {order.discountAmount > 0 && <Row label="Discount" value={`-${formatMoney(order.discountAmount, order.currency)}`} />}
        <Row label="Shipping" value={formatMoney(order.shippingAmount, order.currency)} />
        <Row label="Total" value={formatMoney(order.total, order.currency)} bold />
        <Row label="Status" value={order.status} />
      </div>

      <button onClick={goHome} style={{ ...primaryBtnStyle, marginTop: 28 }}>
        Continue shopping
      </button>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '6px 0',
        fontSize: 13,
        fontWeight: bold ? 800 : 600,
        color: '#0f172a',
      }}
    >
      <span style={{ color: bold ? '#0f172a' : '#64748b' }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

const primaryBtnStyle = {
  padding: '12px 22px',
  borderRadius: 10,
  border: 'none',
  background: '#0f172a',
  color: '#fff',
  fontWeight: 800,
  fontSize: 14,
  cursor: 'pointer',
};
