import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const ToastCtx = createContext(null);
const STYLES = {
  success: { icon: CheckCircle2, cls: 'border-emerald-400/30 text-emerald-300', bar: 'bg-emerald-400' },
  error: { icon: XCircle, cls: 'border-error/40 text-error', bar: 'bg-error' },
  warning: { icon: AlertTriangle, cls: 'border-secondary/40 text-secondary', bar: 'bg-secondary' },
  info: { icon: Info, cls: 'border-sky-300/30 text-sky-300', bar: 'bg-sky-300' },
};

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const timers = useRef({});
  const dismiss = useCallback((id) => { clearTimeout(timers.current[id]); setItems((l) => l.filter((t) => t.id !== id)); }, []);
  const push = useCallback((type, message, opts = {}) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setItems((l) => [...l.slice(-3), { id, type, message, title: opts.title }]);
    timers.current[id] = setTimeout(() => dismiss(id), opts.duration ?? 4800);
    return id;
  }, [dismiss]);
  const api = useMemo(() => ({
    success: (m, o) => push('success', m, o), error: (m, o) => push('error', m || 'Unable to complete this action', o),
    warning: (m, o) => push('warning', m, o), info: (m, o) => push('info', m, o), dismiss,
  }), [push, dismiss]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed z-[100] top-20 sm:top-auto sm:bottom-4 right-4 left-4 sm:left-auto sm:w-[380px] flex flex-col gap-2 pointer-events-none" aria-live="polite" aria-atomic="false">
        {items.map((t) => {
          const S = STYLES[t.type]; const Icon = S.icon;
          return (
            <div key={t.id} role={t.type === 'error' ? 'alert' : 'status'} className={`pointer-events-auto glass animate-toast-in rounded-xl border ${S.cls} shadow-modal flex items-start gap-3 p-3.5 pr-2 relative overflow-hidden`}>
              <span className={`absolute left-0 top-0 bottom-0 w-1 ${S.bar}`} />
              <Icon className="w-5 h-5 mt-0.5 shrink-0" aria-hidden />
              <p className="flex-1 text-body-sm text-on-surface">{t.message}</p>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="p-1 rounded-md text-on-surface-variant hover:text-white hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);
