import { createContext, useEffect, useMemo, useState } from "react";

export const WishlistContext = createContext(null);

const WISHLIST_STORAGE_KEY = "wishlistItems";
const DISCOUNT_NOTIFICATION_KEY = "wishlistDiscountNotifications";

const readStoredWishlist = () => {
  try {
    const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
    const parsedWishlist = storedWishlist ? JSON.parse(storedWishlist) : [];
    return Array.isArray(parsedWishlist) ? parsedWishlist : [];
  } catch {
    return [];
  }
};

const saveStoredWishlist = (wishlistItems) => {
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
};

const readStoredDiscountNotifications = () => {
  try {
    const storedNotifications = localStorage.getItem(DISCOUNT_NOTIFICATION_KEY);
    const parsedNotifications = storedNotifications ? JSON.parse(storedNotifications) : [];
    return Array.isArray(parsedNotifications) ? parsedNotifications : [];
  } catch {
    return [];
  }
};

const saveStoredDiscountNotifications = (notifications) => {
  localStorage.setItem(DISCOUNT_NOTIFICATION_KEY, JSON.stringify(notifications));
};

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
  const [wishlistItems, setWishlistItems] = useState(readStoredWishlist);
  const [discountNotifications, setDiscountNotifications] = useState(readStoredDiscountNotifications);

  useEffect(() => {
    saveStoredWishlist(wishlistItems);
  }, [wishlistItems]);

  useEffect(() => {
    saveStoredDiscountNotifications(discountNotifications);
  }, [discountNotifications]);

  const isInWishlist = (productId) =>
    wishlistItems.some((item) => item.id === productId);

  const toggleWishlist = (product) => {
    setWishlistItems((currentItems) => {
      const exists = currentItems.some((item) => item.id === product.id);

      if (exists) {
        return currentItems.filter((item) => item.id !== product.id);
      }

      return [...currentItems, toWishlistItem(product)];
    });
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
