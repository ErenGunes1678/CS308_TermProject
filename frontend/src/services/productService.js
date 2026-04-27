import api from "./api";

export const getProducts = async (params = {}) => {
  const requestConfig =
    params && Object.keys(params).length > 0 ? { params } : undefined;
  const { data } = await api.get("/product", requestConfig);

  return Array.isArray(data) ? data : data.products || [];
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/product/${id}`);

  return data.product || data;
};
