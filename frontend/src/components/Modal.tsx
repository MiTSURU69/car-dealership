import { useEffect, type ReactNode } from 'react';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** A centered dialog. Closes on Escape or when the dark backdrop is clicked. */
export function Modal({ title, onClose, children }: Props) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="modal-panel w-full max-w-lg rounded-2xl border border-line bg-pine p-7 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="font-display text-3xl font-bold">{title}</h2>
          <button className="btn btn-ghost btn-sm" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}