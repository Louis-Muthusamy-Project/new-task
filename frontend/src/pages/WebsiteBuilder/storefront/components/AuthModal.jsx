import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCart } from '../CartContext';

export default function AuthModal() {
  const { authOpen, closeAuth, login, register } = useCart();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!authOpen) return null;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={closeAuth} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.45)' }} />
      <div
        style={{
          position: 'relative',
          width: 'min(380px, 92vw)',
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 20px 60px rgba(15,23,42,0.25)',
        }}
      >
        <button
          onClick={closeAuth}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
          {mode === 'login' ? 'Sign in' : 'Create an account'}
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>
          {mode === 'login'
            ? 'Sign in to save your cart and see order history.'
            : "We'll bring anything already in your cart along."}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'register' && (
            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder="First name" value={form.firstName} onChange={update('firstName')} style={inputStyle} />
              <input placeholder="Last name" value={form.lastName} onChange={update('lastName')} style={inputStyle} />
            </div>
          )}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={update('email')}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={update('password')}
            required
            minLength={mode === 'register' ? 8 : undefined}
            style={inputStyle}
          />

          {error && <div style={{ color: '#ef4444', fontSize: 12 }}>{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '11px 16px',
              borderRadius: 10,
              border: 'none',
              background: '#0f172a',
              color: '#fff',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
              marginTop: 4,
            }}
          >
            {submitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#64748b' }}>
          {mode === 'login' ? (
            <>
              New here?{' '}
              <button onClick={() => setMode('register')} style={linkStyle}>
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} style={linkStyle}>
                Sign in
              </button>
            </>
          )}
        </div>
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

const linkStyle = {
  background: 'none',
  border: 'none',
  color: '#2563eb',
  fontWeight: 700,
  cursor: 'pointer',
  padding: 0,
  fontSize: 13,
};
