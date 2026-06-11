import api from "./api";

export const getNotifications = async () => {
  const { data } = await api.get("/notifications");
  return data;
};

export const NOTIFICATIONS_INVALIDATED_EVENT = "notifications-invalidated";

export const invalidateNotifications = () => {
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_INVALIDATED_EVENT));
};

export const markSeen = async (notificationId) => {
  const { data } = await api.post("/notifications/seen", { notificationIds: [notificationId] });
  return Array.isArray(data.seenIds) ? new Set(data.seenIds) : new Set();
};

export const markAllSeen = async (notifications) => {
  const ids = notifications.map((n) => n.id);
  const { data } = await api.post("/notifications/seen", { notificationIds: ids });
  return Array.isArray(data.seenIds) ? new Set(data.seenIds) : new Set(ids);
};

export const countUnseen = (seenIds, notifications) => {
  return notifications.filter((n) => !seenIds.has(n.id)).length;
};
