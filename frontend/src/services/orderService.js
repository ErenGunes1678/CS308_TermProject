import api from "./api";

export const placeOrder = async (payload) => {
  const { data } = await api.post("/order", payload);
  return data;
};

export const getOrders = async () => {
  const { data } = await api.get("/order");
  return data;
};
