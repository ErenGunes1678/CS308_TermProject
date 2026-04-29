import api from "./api";

export const getApprovedComments = async (productId) => {
  const { data } = await api.get(`/products/${productId}/comments`);
  return data;
};

export const createComment = async (productId, payload) => {
  const { data } = await api.post(`/products/${productId}/comments`, payload);
  return data;
};

export const getPendingComments = async () => {
  const { data } = await api.get("/comments/pending");
  return data;
};

export const approveComment = async (commentId) => {
  const { data } = await api.patch(`/comments/${commentId}/approve`);
  return data;
};

export const rejectComment = async (commentId) => {
  const { data } = await api.patch(`/comments/${commentId}/reject`);
  return data;
};

export const getApprovedCommentsByProduct = getApprovedComments;
