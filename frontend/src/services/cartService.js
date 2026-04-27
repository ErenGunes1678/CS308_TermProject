import api from "./api";

export const getCart = async () => {
  const { data } = await api.get("/cart");
  return data;
};

export const addCartItem = async (productId, quantity = 1) => {
  const { data } = await api.post("/cart/add", {
    product_id: productId,
    quantity,
  });

  return data;
};

export const decreaseCartItemById = async (itemId) => {
  const { data } = await api.delete(`/cart/item/${itemId}`);
  return data;
};

export const clearCartItems = async () => {
  const { data } = await api.delete("/cart");
  return data;
};
