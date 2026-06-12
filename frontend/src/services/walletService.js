import api from "./api";

export const getWallet = async () => {
  const { data } = await api.get("/wallet");
  return data;
};
