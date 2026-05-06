import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import {
  addCartItem,
  clearCartItems,
  decreaseCartItemById,
  getCart,
} from "../services/cartService";

export const CartContext = createContext(null);

const SHIPPING_COST = 5.99;
const FREE_SHIPPING_MINIMUM = 50;

const mapCartItem = (item) => ({
  id: item.product?.id,
  cartItemId: item.id,
  name: item.product?.name || "",
  brand: item.product?.brand || "",
  image: item.product?.image || "",
  price: Number(item.product?.price || 0),
  quantity: Number(item.quantity || 0),
  stock: Number(item.product?.quantity_in_stock || 0),
});

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);

  const refreshCart = async () => {
    const data = await getCart();
    const items = Array.isArray(data?.items) ? data.items.map(mapCartItem) : [];
    setCartItems(items.filter((item) => item.id));
  };

  useEffect(() => {
    refreshCart().catch(() => {
      setCartItems([]);
    });
  }, [user]);

  const addToCart = async (product, quantity = 1) => {
    const quantityToAdd = Math.max(1, Number(quantity) || 1);
    await addCartItem(product.id, quantityToAdd);
    await refreshCart();
  };

  const removeCartItem = async (cartItemId, quantity = 1) => {
    const removeCount = Math.max(1, Number(quantity) || 1);

    for (let index = 0; index < removeCount; index += 1) {
      await decreaseCartItemById(cartItemId);
    }

    await refreshCart();
  };

  const updateCartItemQuantity = async (item, quantity) => {
    const nextQuantity = Math.max(0, Number(quantity) || 0);
    const currentQuantity = Number(item.quantity || 0);

    if (nextQuantity === currentQuantity) {
      return;
    }

    if (nextQuantity > currentQuantity) {
      await addCartItem(item.id, nextQuantity - currentQuantity);
      await refreshCart();
      return;
    }

    await removeCartItem(item.cartItemId, currentQuantity - nextQuantity);
  };

  const increaseCartItem = async (productId) => {
    await addCartItem(productId, 1);
    await refreshCart();
  };

  const decreaseCartItem = async (cartItemId) => {
    await decreaseCartItemById(cartItemId);
    await refreshCart();
  };

  const clearCart = async () => {
    await clearCartItems();
    setCartItems([]);
  };

  const itemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping =
    itemCount > 0 && subtotal < FREE_SHIPPING_MINIMUM ? SHIPPING_COST : 0;
  const total = subtotal + shipping;
  const amountUntilFreeShipping = Math.max(0, FREE_SHIPPING_MINIMUM - subtotal);

  const value = useMemo(
    () => ({
      cartItems,
      itemCount,
      subtotal,
      shipping,
      total,
      amountUntilFreeShipping,
      refreshCart,
      addToCart,
      removeCartItem,
      updateCartItemQuantity,
      increaseCartItem,
      decreaseCartItem,
      clearCart,
    }),
    [cartItems, itemCount, subtotal, shipping, total, amountUntilFreeShipping]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
