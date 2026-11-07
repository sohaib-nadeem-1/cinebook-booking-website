import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

/** Keeps filter state in the URL so filtered views survive refresh and are shareable. */
export function useQueryState(defaults) {
  const [params, setParams] = useSearchParams();
  const state = Object.fromEntries(Object.entries(defaults).map(([k, d]) => [k, params.get(k) ?? d]));
  const set = useCallback((patch) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(patch).forEach(([k, v]) => { if (v === '' || v == null || v === defaults[k]) next.delete(k); else next.set(k, v); });
      return next;
    }, { replace: true });
  }, [setParams]); // eslint-disable-line react-hooks/exhaustive-deps
  const reset = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams]);
  return [state, set, reset];
}
