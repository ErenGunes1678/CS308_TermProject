import api from "./api";

export const getHiddenReviewProductIds = async () => {
  const { data } = await api.get("/user/review-hidden");
  return Array.isArray(data.hiddenProductIds) ? data.hiddenProductIds : [];
};

export const hideReviewProductId = async (productId) => {
  const { data } = await api.post("/user/review-hidden", { productId });
  return Array.isArray(data.hiddenProductIds) ? data.hiddenProductIds : [];
};

export const markNotificationsSeen = async (notificationIds) => {
  const { data } = await api.post("/notifications/seen", { notificationIds });
  return Array.isArray(data.seenIds) ? data.seenIds : [];
};
