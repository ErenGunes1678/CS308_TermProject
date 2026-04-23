import api from "./api";

export const getProducts = async () => {
  const { data } = await api.get("/products");

  return Array.isArray(data) ? data : data.products || [];
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);

  return data.product || data;
};
