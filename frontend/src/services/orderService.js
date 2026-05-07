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
