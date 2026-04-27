import api from "./api";

export const getProducts = async () => {
  const { data } = await api.get("/product");

  return Array.isArray(data) ? data : data.products || [];
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/product/${id}`);

  return data.product || data;
};
