import { useEffect, useRef } from 'react';

/**
 * Toast — auto-dismissing notification chip.
 * Props: toasts[], removeToast(id)
 */
function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(onClose, 3500);
    return () => clearTimeout(timerRef.current);
  }, [onClose]);

  const icons = { success: '✓', error: '✕', info: 'ℹ' };

  return (
    <div className={`toast ${toast.type}`} role="alert">
      <span className="toast-icon">{icons[toast.type]}</span>
      <span className="toast-msg">{toast.message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss">×</button>
    </div>
  );
}

export default Toast;
