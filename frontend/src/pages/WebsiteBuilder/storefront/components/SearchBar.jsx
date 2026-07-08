import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useStorefront } from '../StorefrontContext';

// SearchBar.jsx — doesn't fetch itself; submitting hands the query off to
// StorefrontContext.goToSearch, which switches the active view to
// SearchResultsPage — the component that actually owns the search fetch.
// Keeps exactly one place ("what does searching for X return") instead of
// the bar and the results page each keeping their own copy of results.
export default function SearchBar() {
  const { goToSearch } = useStorefront();
  const [value, setValue] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const q = value.trim();
    if (q) goToSearch(q);
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 360 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flex: 1,
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: 8,
          padding: '6px 10px',
          background: '#f8fafc',
        }}
      >
        <Search size={14} color="#94a3b8" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search products…"
          style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, width: '100%' }}
        />
      </div>
    </form>
  );
}
