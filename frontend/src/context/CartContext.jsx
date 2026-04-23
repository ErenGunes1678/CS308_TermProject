import { createContext, useEffect, useMemo, useState } from "react";

export const CartContext = createContext(null);

const CART_STORAGE_KEY = "cartItems";
const SHIPPING_COST = 5.99;
const FREE_SHIPPING_MINIMUM = 50;

const readStoredCart = () => {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    const parsedCart = storedCart ? JSON.parse(storedCart) : [];
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    return [];
  }
};

const saveStoredCart = (cartItems) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
};

const getProductImage = (product) =>
  product.image || product.images?.[0] || "";

const toCartItem = (product, quantity) => ({
  id: product.id,
  name: product.name,
  brand: product.brand,
  image: getProductImage(product),
  price: product.price,
  quantity,
});

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(readStoredCart);

  useEffect(() => {
    saveStoredCart(cartItems);
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    const quantityToAdd = Math.max(1, Number(quantity) || 1);

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      }

      return [...currentItems, toCartItem(product, quantityToAdd)];
    });
  };

  const removeCartItem = (productId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId)
    );
  };

  const updateCartItemQuantity = (productId, quantity) => {
    const nextQuantity = Number(quantity) || 0;

    setCartItems((currentItems) => {
      if (nextQuantity <= 0) {
        return currentItems.filter((item) => item.id !== productId);
      }

      return currentItems.map((item) =>
        item.id === productId ? { ...item, quantity: nextQuantity } : item
      );
    });
  };

  const increaseCartItem = (productId) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseCartItem = (productId) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
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
