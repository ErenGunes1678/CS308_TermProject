import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../../context/NotificationContext';
import './NotificationBell.css';

const TYPE_COLOR = {
  order:   '#3b82f6',
  refund:  '#f59e0b',
  comment: '#10b981',
};

const formatAge = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const NotificationBell = ({ userId }) => {
  const { notifications, unseenCount, seenIds, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifications.filter((n) => !seenIds.has(n.id));

  const handleClick = (notif) => {
    markRead(notif.id);
    setOpen(false);
    if (notif.link) navigate(notif.link);
  };

  return (
    <div className="notif-bell" ref={ref}>
      <button
        type="button"
        className="navbar__icon-btn notif-bell__btn"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unseenCount > 0 && (
          <span className="navbar__badge notif-bell__badge">{unseenCount > 9 ? '9+' : unseenCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown__header">
            <div className="notif-dropdown__header-left">
              <span className="notif-dropdown__title">Unread</span>
              {unseenCount > 0 && <span className="notif-dropdown__count">{unseenCount}</span>}
            </div>
            {unseenCount > 0 && (
              <button
                type="button"
                className="notif-dropdown__mark-all"
                onClick={markAllRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="notif-dropdown__list">
            {unread.length === 0 ? (
              <p className="notif-dropdown__empty">You're all caught up ✓</p>
            ) : (
              unread.slice(0, 5).map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  className="notif-item"
                  onClick={() => handleClick(notif)}
                >
                  <span
                    className="notif-item__icon"
                    style={{ background: `${TYPE_COLOR[notif.type]}18`, color: TYPE_COLOR[notif.type] }}
                  >
                    {notif.icon}
                  </span>
                  <div className="notif-item__body">
                    <p className="notif-item__title">{notif.title}</p>
                    <p className="notif-item__text">{notif.body}</p>
                    <p className="notif-item__time">{formatAge(notif.createdAt)}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="notif-dropdown__footer">
            <Link
              to="/customer/notifications"
              className="notif-dropdown__view-all"
              onClick={() => setOpen(false)}
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
