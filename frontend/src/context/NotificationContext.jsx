import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  countUnseen,
  getNotifications,
  markAllSeen,
  markSeen,
  NOTIFICATIONS_INVALIDATED_EVENT,
} from '../services/notificationService';

const POLL_INTERVAL_MS = 30_000; // 30 seconds

const TOAST_DURATION_MS = 5000;

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [seenIds, setSeenIds] = useState(new Set());
  const [unseenCount, setUnseenCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const isFetchingRef = useRef(false);
  const knownIdsRef = useRef(null); // null = first load, Set after that

  const isCustomer = isAuthenticated && user?.role === 'customer';

  const dismissToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  }, []);

  const showToast = useCallback((notif) => {
    const toastId = `toast-manual-${Date.now()}`;
    setToasts((prev) => [...prev, { ...notif, toastId }]);
    setTimeout(() => dismissToast(toastId), TOAST_DURATION_MS);
  }, [dismissToast]);

  const doFetch = useCallback(async () => {
    if (!isCustomer || isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const data = await getNotifications();
      const notifs = data.notifications || [];
      const backendSeenIds = new Set(Array.isArray(data.seenIds) ? data.seenIds : []);

      // Detect genuinely new notifications (not on first load)
      if (knownIdsRef.current !== null) {
        const newOnes = notifs.filter((n) => !knownIdsRef.current.has(n.id));
        if (newOnes.length > 0) {
          setToasts((prev) => {
            const visibleNotificationIds = new Set(prev.map((toast) => toast.id).filter(Boolean));
            const toAdd = newOnes
              .filter((n) => !visibleNotificationIds.has(n.id))
              .map((n) => ({ ...n, toastId: `toast-${n.id}` }));
            return [...prev, ...toAdd];
          });
          // Auto-dismiss each toast after TOAST_DURATION_MS
          newOnes.forEach((n) => {
            setTimeout(() => dismissToast(`toast-${n.id}`), TOAST_DURATION_MS);
          });
        }
      }

      knownIdsRef.current = new Set(notifs.map((n) => n.id));
      setNotifications(notifs);
      setSeenIds(backendSeenIds);
      setUnseenCount(countUnseen(backendSeenIds, notifs));
    } catch {
      // silent
    } finally {
      isFetchingRef.current = false;
    }
  }, [isCustomer, dismissToast]);

  // Initial fetch on login
  useEffect(() => {
    if (isCustomer) {
      doFetch();
    } else {
      setNotifications([]);
      setUnseenCount(0);
    }
  }, [isCustomer, doFetch]);

  // Polling — pauses when tab is hidden
  useEffect(() => {
    if (!isCustomer) return;

    const tick = () => {
      if (document.visibilityState === 'visible') doFetch();
    };

    const id = setInterval(tick, POLL_INTERVAL_MS);
    document.addEventListener('visibilitychange', tick);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [isCustomer, doFetch]);

  // Manual invalidation (e.g. after user submits a refund)
  useEffect(() => {
    window.addEventListener(NOTIFICATIONS_INVALIDATED_EVENT, doFetch);
    return () => window.removeEventListener(NOTIFICATIONS_INVALIDATED_EVENT, doFetch);
  }, [doFetch]);

  const markRead = useCallback(async (id) => {
    try {
      const nextSeenIds = await markSeen(id);
      setSeenIds(nextSeenIds);
      setUnseenCount((count) => Math.max(0, count - 1));
    } catch {
      // ignore failed marking for now
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      const nextSeenIds = await markAllSeen(notifications);
      setSeenIds(nextSeenIds);
      setUnseenCount(0);
    } catch {
      // ignore failed marking for now
    }
  }, [notifications]);

  return (
    <NotificationContext.Provider value={{ notifications, seenIds, unseenCount, toasts, dismissToast, showToast, refresh: doFetch, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
};
