import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useStorefront } from '../StorefrontContext';
import { useCart } from '../CartContext';
import { storefrontApi } from '../../../../api/storefrontApi';

function formatMoney(amount, currency) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(
    amount || 0
  );
}

const STEPS = ['Shipping', 'Payment', 'Review'];

function StepIndicator({ step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 800,
                background: i <= step ? '#0f172a' : '#e2e8f0',
                color: i <= step ? '#fff' : '#94a3b8',
              }}
            >
              {i < step ? <Check size={13} /> : i + 1}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: i <= step ? '#0f172a' : '#94a3b8' }}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && <div style={{ width: 24, height: 1, background: '#e2e8f0' }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function OrderSummary({ cart, currency, shippingPrice }) {
  const taxAmount = cart?.tax?.amount || 0;
  const total = Math.max(
    0,
    (cart?.subtotal || 0) - (cart?.discount?.valid ? cart.discount.amount : 0) + taxAmount + (shippingPrice || 0)
  );
  return (
    <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Order summary</div>
      {(cart?.items || []).map((line) => (
        <div key={String(line.productId)} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, color: '#334155' }}>
          <span>{line.title} × {line.quantity}</span>
          <span>{formatMoney(line.lineTotal, line.currency || currency)}</span>
        </div>
      ))}
      <div style={{ borderTop: '1px solid #e2e8f0', margin: '10px 0', paddingTop: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#334155', marginBottom: 4 }}>
          <span>Subtotal</span>
          <span>{formatMoney(cart?.subtotal, currency)}</span>
        </div>
        {cart?.discount?.valid && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#059669', marginBottom: 4 }}>
            <span>Discount ({cart.discount.code})</span>
            <span>-{formatMoney(cart.discount.amount, currency)}</span>
          </div>
        )}
        {taxAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#334155', marginBottom: 4 }}>
            <span>{cart?.tax?.label || 'Tax'}{cart?.tax?.rate ? ` (${cart.tax.rate}%)` : ''}</span>
            <span>{formatMoney(taxAmount, currency)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#334155', marginBottom: 4 }}>
          <span>Shipping</span>
          <span>{shippingPrice != null ? formatMoney(shippingPrice, currency) : '—'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
          <span>Total</span>
          <span>{formatMoney(total, currency)}</span>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { storeId, currency, goHome, goToConfirmation } = useStorefront();
  const { cart, loading, setContact, setShipping, setPaymentMethod, checkout, isSignedIn, customer, openAuth } =
    useCart();

  // Funnel event — fired once per checkout attempt (not once per step),
  // and only once the cart has actually loaded with items, so an empty
  // or not-yet-loaded cart landing on this route doesn't inflate the
  // Checkout Starts number. See storefrontApi.trackEvent.
  useEffect(() => {
    if (cart?.items?.length) {
      storefrontApi.trackEvent(storeId, 'checkout_start', { quantity: cart.items.length });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, Boolean(cart?.items?.length)]);

  const [step, setStep] = useState(0);
  const [contact, setContactForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
  });
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  // Prefill from whatever the cart already has (a returning shopper, or a
  // guest who filled in Shipping then logged in mid-checkout).
  useEffect(() => {
    if (!cart) return;
    setContactForm((f) => ({
      ...f,
      email: cart.contactEmail || (isSignedIn ? customer?.email || '' : f.email),
      ...cart.shippingAddress,
    }));
    if (cart.shippingChoice?.rateName) setSelectedShipping(cart.shippingChoice);
    if (cart.paymentMethod) setSelectedPayment(cart.paymentMethod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?.id]);

  if (loading && !cart) {
    return <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>Loading checkout…</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ color: '#94a3b8', fontWeight: 700, marginBottom: 16 }}>Your cart is empty.</div>
        <button onClick={goHome} style={primaryBtnStyle}>
          Continue shopping
        </button>
      </div>
    );
  }

  const update = (field) => (e) => setContactForm((f) => ({ ...f, [field]: e.target.value }));

  const handleContinueFromShipping = async () => {
    setFormError('');
    if (!contact.email || !contact.line1 || !contact.city || !contact.country) {
      setFormError('Fill in your email and shipping address to continue.');
      return;
    }
    setBusy(true);
    try {
      await setContact({
        email: contact.email,
        shippingAddress: {
          firstName: contact.firstName,
          lastName: contact.lastName,
          line1: contact.line1,
          line2: contact.line2,
          city: contact.city,
          state: contact.state,
          postalCode: contact.postalCode,
          country: contact.country,
          phone: contact.phone,
        },
      });
      const { rates } = await storefrontApi.getShippingOptions(storeId, {
        country: contact.country,
        subtotal: cart.subtotal,
      });
      setShippingOptions(rates);
      if (rates.length && !selectedShipping) setSelectedShipping(rates[0]);
      const methods = await storefrontApi.getPaymentMethods(storeId);
      setPaymentMethods(methods);
      if (methods.length && !selectedPayment) setSelectedPayment(methods[0].method);
      setStep(1);
    } catch (err) {
      setFormError(err.message || 'Could not continue to shipping options.');
    } finally {
      setBusy(false);
    }
  };

  const handleContinueFromPayment = async () => {
    setFormError('');
    if (!selectedShipping) {
      setFormError('Choose a shipping option to continue.');
      return;
    }
    if (!selectedPayment) {
      setFormError('Choose a payment method to continue.');
      return;
    }
    setBusy(true);
    try {
      await setShipping({
        zoneId: selectedShipping.zoneId,
        rateName: selectedShipping.name,
        price: selectedShipping.price,
      });
      await setPaymentMethod(selectedPayment);
      setStep(2);
    } catch (err) {
      setFormError(err.message || 'Could not save your payment method.');
    } finally {
      setBusy(false);
    }
  };

  const handlePlaceOrder = async () => {
    setFormError('');
    setBusy(true);
    try {
      const order = await checkout({
        paymentMethod: selectedPayment,
        customer: { name: `${contact.firstName} ${contact.lastName}`.trim(), email: contact.email },
      });
      goToConfirmation(order);
    } catch (err) {
      setFormError(err.message || 'Could not place your order.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto' }}>
      <span
        role="button"
        tabIndex={0}
        onClick={goHome}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#2563eb', cursor: 'pointer', marginBottom: 20 }}
      >
        <ArrowLeft size={14} /> Back to store
      </span>

      <StepIndicator step={step} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: 32 }}>
        <div>
          {!isSignedIn && (
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#475569', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Checking out as a guest.</span>
              <button onClick={openAuth} style={{ ...linkBtnStyle }}>
                Sign in
              </button>
            </div>
          )}

          {step === 0 && (
            <div>
              <h2 style={sectionTitleStyle}>Contact & shipping address</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input type="email" placeholder="Email" value={contact.email} onChange={update('email')} style={inputStyle} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <input placeholder="First name" value={contact.firstName} onChange={update('firstName')} style={inputStyle} />
                  <input placeholder="Last name" value={contact.lastName} onChange={update('lastName')} style={inputStyle} />
                </div>
                <input placeholder="Address" value={contact.line1} onChange={update('line1')} style={inputStyle} />
                <input placeholder="Apartment, suite, etc. (optional)" value={contact.line2} onChange={update('line2')} style={inputStyle} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <input placeholder="City" value={contact.city} onChange={update('city')} style={inputStyle} />
                  <input placeholder="State / Province" value={contact.state} onChange={update('state')} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input placeholder="Postal code" value={contact.postalCode} onChange={update('postalCode')} style={inputStyle} />
                  <input placeholder="Country" value={contact.country} onChange={update('country')} style={inputStyle} />
                </div>
                <input placeholder="Phone (optional)" value={contact.phone} onChange={update('phone')} style={inputStyle} />
              </div>
              {formError && <div style={errorStyle}>{formError}</div>}
              <button onClick={handleContinueFromShipping} disabled={busy} style={{ ...primaryBtnStyle, marginTop: 16 }}>
                {busy ? 'Please wait…' : 'Continue to shipping'}
              </button>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 style={sectionTitleStyle}>Shipping method</h2>
              {shippingOptions.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
                  No shipping methods are configured for your country yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {shippingOptions.map((rate) => (
                    <label
                      key={`${rate.zoneId}-${rate.name}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: `2px solid ${selectedShipping?.name === rate.name ? '#0f172a' : '#e2e8f0'}`,
                        borderRadius: 10,
                        padding: '12px 14px',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="radio"
                          checked={selectedShipping?.name === rate.name}
                          onChange={() => setSelectedShipping(rate)}
                        />
                        <span>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{rate.name}</div>
                          {rate.deliveryTime && <div style={{ fontSize: 12, color: '#94a3b8' }}>{rate.deliveryTime}</div>}
                        </span>
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                        {rate.price === 0 ? 'Free' : formatMoney(rate.price, currency)}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <h2 style={sectionTitleStyle}>Payment method</h2>
              {paymentMethods.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
                  No payment methods are enabled for this store yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {paymentMethods.map((m) => (
                    <label
                      key={m.method}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: `2px solid ${selectedPayment === m.method ? '#0f172a' : '#e2e8f0'}`,
                        borderRadius: 10,
                        padding: '12px 14px',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input type="radio" checked={selectedPayment === m.method} onChange={() => setSelectedPayment(m.method)} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{m.label}</span>
                      </span>
                      {m.method === 'cod' && m.extraFee > 0 && (
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>+{formatMoney(m.extraFee, currency)} fee</span>
                      )}
                    </label>
                  ))}
                </div>
              )}

              {formError && <div style={errorStyle}>{formError}</div>}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={() => setStep(0)} style={secondaryBtnStyle}>
                  Back
                </button>
                <button onClick={handleContinueFromPayment} disabled={busy} style={primaryBtnStyle}>
                  {busy ? 'Please wait…' : 'Review order'}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={sectionTitleStyle}>Review & place order</h2>
              <div style={{ fontSize: 13, color: '#475569', marginBottom: 16, lineHeight: 1.8 }}>
                <div><strong>Contact:</strong> {contact.email}</div>
                <div>
                  <strong>Ship to:</strong> {contact.line1}, {contact.city} {contact.postalCode}, {contact.country}
                </div>
                <div>
                  <strong>Shipping:</strong> {selectedShipping?.name} (
                  {selectedShipping?.price === 0 ? 'Free' : formatMoney(selectedShipping?.price, currency)})
                </div>
                <div>
                  <strong>Payment:</strong> {paymentMethods.find((m) => m.method === selectedPayment)?.label || selectedPayment}
                </div>
              </div>
              {formError && <div style={errorStyle}>{formError}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(1)} style={secondaryBtnStyle}>
                  Back
                </button>
                <button onClick={handlePlaceOrder} disabled={busy} style={primaryBtnStyle}>
                  {busy ? 'Placing order…' : 'Place order'}
                </button>
              </div>
            </div>
          )}
        </div>

        <OrderSummary cart={cart} currency={currency} shippingPrice={step >= 1 ? selectedShipping?.price ?? 0 : cart?.shippingChoice?.price} />
      </div>
    </div>
  );
}

const inputStyle = {
  flex: 1,
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  fontSize: 13,
  width: '100%',
  boxSizing: 'border-box',
};

const primaryBtnStyle = {
  padding: '12px 20px',
  borderRadius: 10,
  border: 'none',
  background: '#0f172a',
  color: '#fff',
  fontWeight: 800,
  fontSize: 14,
  cursor: 'pointer',
};

const secondaryBtnStyle = {
  padding: '12px 20px',
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  background: '#fff',
  color: '#0f172a',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
};

const linkBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#2563eb',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 13,
};

const sectionTitleStyle = { fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' };

const errorStyle = { color: '#ef4444', fontSize: 12, marginTop: 10 };