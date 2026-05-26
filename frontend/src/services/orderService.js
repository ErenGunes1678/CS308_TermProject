import api from "./api";

export const placeOrder = async (payload) => {
  const { data } = await api.post("/order", payload);
  return data;
};

export const getOrders = async () => {
  const { data } = await api.get("/order");
  return data;
};

export const getAllOrders = async () => {
  const { data } = await api.get("/order/admin");
  return data;
};

export const updateOrderStatus = async (orderId, status) => {
  const { data } = await api.patch(`/order/${orderId}/status`, { status });
  return data;
};

export const cancelOrder = async (orderId) => {
  const { data } = await api.patch(`/order/${orderId}/cancel`);
  return data;
};

export const requestRefund = async (orderItemId, reason = "") => {
  const { data } = await api.post(`/order/items/${orderItemId}/refund-request`, { reason });
  return data;
};

export const getRefundRequests = async () => {
  const { data } = await api.get("/order/refund-requests");
  return data;
};

export const resolveRefundRequest = async (requestId, status) => {
  const { data } = await api.patch(`/order/refund-requests/${requestId}`, { status });
  return data;
};
