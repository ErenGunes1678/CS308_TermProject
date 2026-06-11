import api from "./api";

export const getDiscountCodes = async () => {
  const { data } = await api.get("/discount");
  return Array.isArray(data.codes) ? data.codes : data.codes || [];
};

export const createDiscountCode = async (payload) => {
  const { data } = await api.post("/discount", payload);
  return data.discountCode;
};

export const toggleDiscountCode = async (id) => {
  const { data } = await api.patch(`/discount/${id}/toggle`);
  return data.discountCode;
};

export const deleteDiscountCode = async (id) => {
  const { data } = await api.delete(`/discount/${id}`);
  return data;
};
