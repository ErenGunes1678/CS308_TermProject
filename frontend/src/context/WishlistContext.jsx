import { createContext, useEffect, useMemo, useState } from "react";

export const WishlistContext = createContext(null);

const WISHLIST_STORAGE_KEY = "wishlistItems";

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

  useEffect(() => {
    saveStoredWishlist(wishlistItems);
  }, [wishlistItems]);

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

  const value = useMemo(
    () => ({
      wishlistItems,
      wishlistCount: wishlistItems.length,
      isInWishlist,
      toggleWishlist,
    }),
    [wishlistItems]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
