import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationContext';
import { getSeenIds } from '../../services/notificationService';
import './NotificationsPage.css';

const TYPE_COLOR = {
  order:   { bg: '#eff6ff', color: '#1d4ed8' },
  refund:  { bg: '#fffbeb', color: '#d97706' },
  comment: { bg: '#f0fdf4', color: '#16a34a' },
};

const formatAge = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const NotificationsPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { notifications, markRead, markAllRead } = useNotifications();
  const [, forceUpdate] = useState(0);
  const [filter, setFilter] = useState('all');

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'customer') return <Navigate to="/unauthorized" replace />;

  const handleMarkRead = (id) => {
    markRead(id);
    forceUpdate((n) => n + 1);
  };

  const handleMarkAllRead = () => {
    markAllRead();
    forceUpdate((n) => n + 1);
  };

  const currentSeenIds = getSeenIds(user?.id);
  const unreadCount = notifications.filter((n) => !currentSeenIds.has(n.id)).length;
  const visible = filter === 'unread'
    ? notifications.filter((n) => !currentSeenIds.has(n.id))
    : notifications;

  return (
    <div className="notif-page">
      <div className="container notif-page__header">
        <div>
          <p className="notif-page__eyebrow">My Account</p>
          <h1 className="notif-page__title">Notifications</h1>
        </div>
        <Link to="/customer" className="notif-page__back">Back to Account</Link>
      </div>

      <div className="container notif-page__body">
        <div className="notif-page__toolbar">
          <div className="notif-page__filters">
            <button
              type="button"
              className={`notif-filter-btn ${filter === 'all' ? 'is-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
              <span className="notif-filter-btn__count">{notifications.length}</span>
            </button>
            <button
              type="button"
              className={`notif-filter-btn ${filter === 'unread' ? 'is-active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread
              {unreadCount > 0 && <span className="notif-filter-btn__count notif-filter-btn__count--red">{unreadCount}</span>}
            </button>
          </div>
          {unreadCount > 0 && (
            <button type="button" className="notif-mark-all-btn" onClick={handleMarkAllRead}>
              Mark all as read
            </button>
          )}
        </div>

        {visible.length === 0 ? (
          <div className="notif-page__empty">
            <p className="notif-page__empty-icon">🔔</p>
            <h2>{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</h2>
            {filter === 'unread' && <button type="button" className="notif-page__show-all" onClick={() => setFilter('all')}>Show all notifications</button>}
          </div>
        ) : (
          <div className="notif-page__list">
            {visible.map((notif) => {
              const unread = !currentSeenIds.has(notif.id);
              const colors = TYPE_COLOR[notif.type] || TYPE_COLOR.order;
              return (
                <div
                  key={notif.id}
                  className={`notif-page-item ${unread ? 'is-unread' : ''}`}
                >
                  <span
                    className="notif-page-item__icon"
                    style={{ background: colors.bg, color: colors.color }}
                  >
                    {notif.icon}
                  </span>
                  <div className="notif-page-item__body">
                    <p className="notif-page-item__title">{notif.title}</p>
                    <p className="notif-page-item__text">{notif.body}</p>
                    <p className="notif-page-item__time">{formatAge(notif.createdAt)}</p>
                  </div>
                  <div className="notif-page-item__actions">
                    {notif.link && (
                      <button
                        type="button"
                        className="notif-page-item__go"
                        onClick={() => { handleMarkRead(notif.id); navigate(notif.link); }}
                      >
                        View →
                      </button>
                    )}
                    {unread && (
                      <button
                        type="button"
                        className="notif-page-item__read-btn"
                        title="Mark as read"
                        onClick={() => handleMarkRead(notif.id)}
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
