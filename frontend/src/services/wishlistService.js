import api from "./api";

export const getWishlistItems = async () => {
  const { data } = await api.get("/wishlist");
  if (!Array.isArray(data.items)) {
    return [];
  }

  return data.items
    .map((item) => item.product || item)
    .filter(Boolean);
};

export const addProductToWishlist = async (productId) => {
  const { data } = await api.post(`/wishlist/${productId}`);
  return data;
};

export const removeProductFromWishlist = async (productId) => {
  const { data } = await api.delete(`/wishlist/${productId}`);
  return data;
};
