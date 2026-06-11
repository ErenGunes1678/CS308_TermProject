import api from "./api";

export const getCategories = async () => {
  const { data } = await api.get("/category");
  return data.categories || [];
};

export const createCategory = async (payload) => {
  const { data } = await api.post("/category", payload);
  return data.category || data;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/category/${id}`);
  return data;
};

export const updateCategory = async (id, payload) => {
  const { data } = await api.patch(`/category/${id}`, payload);
  return data.category || data;
};
