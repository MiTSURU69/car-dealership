import { useCallback, useEffect, useState } from 'react';

export interface ToastState {
  id: number;
  message: string;
  kind: 'success' | 'error';
}

/** Holds one toast message that disappears by itself after a few seconds. */
export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message: string, kind: ToastState['kind'] = 'success') => {
    setToast({ id: Date.now(), message, kind });
  }, []);

  return { toast, showToast };
}

export function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;
  const tone =
    toast.kind === 'success'
      ? 'border-brass/50 text-cream'
      : 'border-danger/60 text-danger';
  return (
    <div
      key={toast.id}
      role="status"
      className={`toast rounded-xl border bg-pine/95 px-5 py-3 text-sm font-semibold shadow-2xl backdrop-blur ${tone}`}
    >
      {toast.message}
    </div>
  );
}