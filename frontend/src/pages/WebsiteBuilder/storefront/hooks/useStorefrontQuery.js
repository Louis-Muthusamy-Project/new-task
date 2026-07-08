import { useEffect, useRef, useState, useCallback } from 'react';

// useStorefrontQuery.js — the single data-fetching hook every storefront
// section uses. Centralizing loading/error/data state here means there is
// exactly one implementation of "how does a section ask the Store Engine
// for data" — no component rolls its own useEffect+useState fetch, and no
// two components hold separate copies of the same server state (the
// storefrontApi GET cache underneath additionally dedupes the network
// call itself when two sections request the same URL in the same tick).
//
// `fetcher` should be a stable function (defined inline is fine — deps
// controls when it re-runs, matching useEffect's own convention).
export function useStorefrontQuery(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const requestId = useRef(0);

  const run = useCallback(() => {
    const id = ++requestId.current;
    setState((s) => ({ ...s, loading: true, error: null }));

    Promise.resolve()
      .then(fetcher)
      .then((data) => {
        if (id !== requestId.current) return; // a newer request superseded this one
        setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (id !== requestId.current) return;
        setState({ data: null, loading: false, error: err?.message || 'Failed to load.' });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return { ...state, reload: run };
}
