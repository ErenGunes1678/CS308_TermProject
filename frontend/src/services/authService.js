import api from "./api";

export const getAuthErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  fallbackMessage;

export const saveAuthSession = ({ token, user }) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const loginUser = async ({ email, password }) => {
  const { data } = await api.post("/auth/login", {
    email,
    password,
  });

  saveAuthSession(data);

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
