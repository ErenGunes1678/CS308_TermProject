import api from "./api";

export const getNotifications = async () => {
  const { data } = await api.get("/notifications");
  return data;
};

const SEEN_KEY = (userId) => `notif_seen_${userId}`;
export const NOTIFICATIONS_SEEN_UPDATED_EVENT = "notifications-seen-updated";
export const NOTIFICATIONS_INVALIDATED_EVENT = "notifications-invalidated";

export const invalidateNotifications = () => {
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_INVALIDATED_EVENT));
};

const saveSeenIds = (userId, ids) => {
  localStorage.setItem(SEEN_KEY(userId), JSON.stringify([...ids]));
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_SEEN_UPDATED_EVENT, {
    detail: { userId },
  }));
  return ids;
};

export const getSeenIds = (userId) => {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY(userId)) || "[]"));
  } catch {
    return new Set();
  }
};

export const markSeen = (userId, notificationId) => {
  const seen = getSeenIds(userId);
  seen.add(notificationId);
  return saveSeenIds(userId, seen);
};

export const markAllSeen = (userId, notifications) => {
  const ids = notifications.map((n) => n.id);
  return saveSeenIds(userId, new Set(ids));
};

export const countUnseen = (userId, notifications) => {
  const seen = getSeenIds(userId);
  return notifications.filter((n) => !seen.has(n.id)).length;
};
