import { useCallback, useEffect, useRef, useState } from 'react';

/** Runs an async loader, ignoring out-of-order responses. Returns {data, loading, error, reload, setData}. */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const seq = useRef(0);
  const fnRef = useRef(fn); fnRef.current = fn;
  const run = useCallback((silent = false) => {
    const id = ++seq.current;
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    return Promise.resolve().then(() => fnRef.current()).then(
      (data) => { if (id === seq.current) setState({ data, loading: false, error: null }); },
      (error) => { if (id === seq.current) setState((s) => ({ data: s.data, loading: false, error })); },
    );
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { run(); }, deps);
  const setData = useCallback((updater) => setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })), []);
  return { ...state, reload: run, setData };
}
