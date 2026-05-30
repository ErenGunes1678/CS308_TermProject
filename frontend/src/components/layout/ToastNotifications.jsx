import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import './ToastNotifications.css';

const TYPE_COLOR = {
  order:   { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
  refund:  { bg: '#fffbeb', border: '#fde68a', color: '#d97706' },
  comment: { bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a' },
};

const Toast = ({ toast, onDismiss }) => {
  const navigate = useNavigate();
  const colors = TYPE_COLOR[toast.type] || TYPE_COLOR.order;

  const handleClick = () => {
    onDismiss(toast.toastId);
    if (toast.link) navigate(toast.link);
  };

  return (
    <div
      className="toast"
      style={{ borderColor: colors.border, background: colors.bg }}
      role="alert"
    >
      <span className="toast__icon" style={{ color: colors.color }}>{toast.icon}</span>
      <div className="toast__body">
        <p className="toast__title">{toast.title}</p>
        <p className="toast__text">{toast.body}</p>
      </div>
      <div className="toast__actions">
        {toast.link && (
          <button type="button" className="toast__go" onClick={handleClick}>
            View
          </button>
        )}
        <button type="button" className="toast__close" onClick={() => onDismiss(toast.toastId)} aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  );
};

const ToastNotifications = () => {
  const { toasts, dismissToast } = useNotifications();

  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <Toast key={toast.toastId} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
};

export default ToastNotifications;
