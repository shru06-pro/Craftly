// src/context/WishlistContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

const WISHLIST_STORAGE_KEY = 'craftly_wishlist_items_v1';

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse wishlist from localStorage', e);
      return [];
    }
  });

  // Persist to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to persist wishlist to localStorage', e);
    }
  }, [wishlist]);

  // Check if a product ID exists in the wishlist
  const isInWishlist = (productId) => {
    if (!productId) return false;
    return wishlist.some((item) => item.id === productId);
  };

  // Add product preventing duplicates
  const addToWishlist = (product) => {
    if (!product || !product.id) return;
    setWishlist((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  // Remove product by ID
  const removeFromWishlist = (productId) => {
    if (!productId) return;
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  // Toggle wishlist presence
  const toggleWishlist = (product) => {
    if (!product || !product.id) return;
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  // Clear all saved items
  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
