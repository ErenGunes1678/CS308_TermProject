import api from "./api";

export const searchProducts = async (params = {}) => {
  const { data } = await api.get("/search", { params });
  return Array.isArray(data) ? data : data.products || [];
};
