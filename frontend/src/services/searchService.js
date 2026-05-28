import api from "./api";

export const searchProducts = async (params = {}) => {
  const { data } = await api.get("/search", { params });
  const products = Array.isArray(data) ? data : data.products || [];
  return products.filter((product) => Number(product.price) > 0);
};
