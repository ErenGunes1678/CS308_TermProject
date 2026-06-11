import api from "./api";

export const getAuthErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  fallbackMessage;

export const loginUser = async ({ email, password }) => {
  const { data } = await api.post("/auth/login", {
    email,
    password,
  });

  return data;
};

export const registerUser = async ({ name, email, password }) => {
  const { data } = await api.post("/auth/register", {
    name,
    email,
    password,
  });

  return data;
};

export const updateCurrentUser = async (payload) => {
  const { data } = await api.patch("/auth/me", payload);
  return data;
};

export const logoutUser = async () => {
  await api.post("/auth/logout");
};

export const getCurrentUser = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const { data } = await api.patch("/auth/change-password", { currentPassword, newPassword });
  return data;
};
