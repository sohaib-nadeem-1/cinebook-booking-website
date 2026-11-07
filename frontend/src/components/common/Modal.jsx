
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from './Button.jsx';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  variant = 'dialog',
  dismissable = true,
  labelledBy,
}) {
  const ref = useRef(null);
  const lastFocus = useRef(null);
  const onCloseRef = useRef(onClose);

  // Always keep the latest callback without restarting the effect.
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    lastFocus.current = document.activeElement;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      const element =
        ref.current?.querySelector('[data-autofocus]') ||
        ref.current?.querySelector(FOCUSABLE);

      element?.focus();
    }, 30);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && dismissable) {
        e.stopPropagation();
        onCloseRef.current?.();
      }

      if (e.key === 'Tab' && ref.current) {
        const elements = [
          ...ref.current.querySelectorAll(FOCUSABLE),
        ];

        if (!elements.length) return;

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (
          e.shiftKey &&
          document.activeElement === first
        ) {
          e.preventDefault();
          last.focus();
        } else if (
          !e.shiftKey &&
          document.activeElement === last
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);

      document.removeEventListener(
        'keydown',
        handleKeyDown
      );

      document.body.style.overflow = previousOverflow;

      lastFocus.current?.focus?.();
    };
  }, [open, dismissable]);

  if (!open) return null;

  const width = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-xl',
    lg: 'sm:max-w-3xl',
    xl: 'sm:max-w-5xl',
  }[size];

  const drawer = variant === 'drawer';

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center animate-fade-in"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={
          dismissable
            ? () => onCloseRef.current?.()
            : undefined
        }
        aria-hidden
      />

      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy || 'modal-title'}
        aria-describedby={
          description ? 'modal-desc' : undefined
        }
        className={`relative glass shadow-modal w-full max-h-[92vh] flex flex-col animate-sheet-up rounded-t-3xl ${
          drawer
            ? 'sm:ml-auto sm:h-full sm:max-h-full sm:max-w-lg sm:rounded-none sm:rounded-l-3xl'
            : `sm:rounded-2xl ${width}`
        }`}
        style={{ background: 'rgba(24,26,34,.96)' }}
      >
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-white/5">
          <div>
            <h2
              id="modal-title"
              className="font-headline text-headline-sm text-white"
            >
              {title}
            </h2>

            {description && (
              <p
                id="modal-desc"
                className="mt-1 text-body-sm text-on-surface-variant"
              >
                {description}
              </p>
            )}
          </div>

          {dismissable && (
            <button
              type="button"
              onClick={() => onCloseRef.current?.()}
              aria-label="Close dialog"
              className="p-2 -mr-2 -mt-1 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {children}
        </div>

        {footer && (
          <div className="p-4 sm:p-5 border-t border-white/5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  loading = false,
  children,
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      dismissable={!loading}
      size="sm"
      title={title}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            loadingText="Working…"
            data-autofocus
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-body-md text-on-surface-variant">
        {message}
      </p>

      {children}
    </Modal>
  );
}
