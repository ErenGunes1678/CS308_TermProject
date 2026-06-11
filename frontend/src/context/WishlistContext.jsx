import { createContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  getWishlistItems,
  addProductToWishlist,
  removeProductFromWishlist,
} from "../services/wishlistService";

export const WishlistContext = createContext(null);

const getProductImage = (product) =>
  product.image || product.images?.[0] || "";

const toWishlistItem = (product) => ({
  id: product.id,
  name: product.name,
  brand: product.brand,
  image: getProductImage(product),
  price: product.price,
});

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [discountNotifications, setDiscountNotifications] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      return;
    }

    let isMounted = true;

    const loadWishlist = async () => {
      try {
        const items = await getWishlistItems();
        if (!isMounted) return;
        setWishlistItems(items.map(toWishlistItem));
      } catch {
        if (isMounted) {
          setWishlistItems([]);
        }
      }
    };

    loadWishlist();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const isInWishlist = (productId) =>
    wishlistItems.some((item) => item.id === productId);

  const toggleWishlist = async (product) => {
    const exists = wishlistItems.some((item) => item.id === product.id);

    try {
      if (exists) {
        await removeProductFromWishlist(product.id);
        setWishlistItems((currentItems) =>
          currentItems.filter((item) => item.id !== product.id)
        );
        return;
      }

      await addProductToWishlist(product.id);
      setWishlistItems((currentItems) => [
        ...currentItems,
        toWishlistItem(product),
      ]);
    } catch (error) {
      console.error("Wishlist update failed", error);
    }
  };

  const addDiscountNotification = (notification) => {
    const nextNotification = {
      id: `${notification.productId}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...notification,
    };

    setDiscountNotifications((currentNotifications) => [
      nextNotification,
      ...currentNotifications,
    ]);

    return nextNotification;
  };

  const clearDiscountNotifications = () => {
    setDiscountNotifications([]);
  };

  const value = useMemo(
    () => ({
      wishlistItems,
      wishlistCount: wishlistItems.length,
      discountNotifications,
      isInWishlist,
      toggleWishlist,
      addDiscountNotification,
      clearDiscountNotifications,
    }),
    [discountNotifications, wishlistItems]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
