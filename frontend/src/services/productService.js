import api from "./api";

export const getProducts = async (params = {}) => {
  const { data } = await api.get("/product", { params });

  return Array.isArray(data) ? data : data.products || [];
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/product/${id}`);

  return data.product || data;
};

export const createProduct = async (payload) => {
  const { data } = await api.post("/product", payload);
  return data.product || data;
};

export const updateProduct = async (id, payload) => {
  const { data } = await api.put(`/product/${id}`, payload);
  return data.product || data;
};

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/product/${id}`);
  return data;
};
