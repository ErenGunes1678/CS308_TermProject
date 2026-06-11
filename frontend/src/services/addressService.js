import api from "./api";

export const getAddresses = async () => {
  const { data } = await api.get("/addresses");
  return data.addresses || [];
};

export const createAddress = async (payload) => {
  const { data } = await api.post("/addresses", payload);
  return data.address || data;
};

export const updateAddress = async (id, payload) => {
  const { data } = await api.put(`/addresses/${id}`, payload);
  return data.address || data;
};

export const deleteAddress = async (id) => {
  const { data } = await api.delete(`/addresses/${id}`);
  return data;
};

export const setDefaultAddress = async (id) => {
  const { data } = await api.patch(`/addresses/${id}/default`);
  return data.address || data;
};
