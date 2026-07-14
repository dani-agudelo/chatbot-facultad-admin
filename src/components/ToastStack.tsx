import { useEffect } from 'react';

type Toast = { id: number; message: string; tone?: 'success' | 'error' | 'info' };

type Props = {
  toasts: Toast[];
  onDismiss: (id: number) => void;
};

export function ToastStack({ toasts, onDismiss }: Props) {
  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((toast) =>
      window.setTimeout(() => onDismiss(toast.id), 3500),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [toasts, onDismiss]);

  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.tone || 'info'}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
