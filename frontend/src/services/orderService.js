import api from "./api";

export const placeOrder = async () => {
  const { data } = await api.post("/order");
  return data;
};

export const getOrders = async () => {
  const { data } = await api.get("/order");
  return data;
};
