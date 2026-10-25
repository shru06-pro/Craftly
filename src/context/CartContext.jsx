// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = 'craftly_cart_items_v1';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse cart from localStorage', e);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code: 'CRAFTLY10', percent: 10 }

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to persist cart to localStorage', e);
    }
  }, [cartItems]);

  // Add an item to the cart
  const addToCart = (product, customization = {}) => {
    const selectedColor = customization.selectedColor || product.colorVariants?.[0] || {
      name: 'Standard',
      hex: '#FAF6EE',
      image: product.image,
    };
    const selectedSize = customization.selectedSize || product.availableSizes?.[0] || 'Standard';
    const isCustomSized = Boolean(customization.isCustomSized);
    const customMeasurements = customization.customMeasurements || null;
    const tailoringFee = isCustomSized ? (product.tailoringFee || 350) : 0;
    const monogramInitials = customization.monogramInitials || '';
    const quantity = customization.quantity || 1;

    // Unique cart item identifier based on specific configuration
    const configKey = `${product.id}-${selectedColor.name}-${selectedSize}-${
      isCustomSized ? JSON.stringify(customMeasurements) : ''
    }-${monogramInitials}`;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.configKey === configKey);
      if (existingIndex > -1) {
        const copy = [...prevItems];
        copy[existingIndex].quantity += quantity;
        return copy;
      }

      const newItem = {
        cartItemId: 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        configKey,
        product,
        selectedColor,
        selectedSize,
        isCustomSized,
        customMeasurements,
        tailoringFee,
        monogramInitials,
        quantity,
        addedAt: new Date().toISOString(),
      };
      return [...prevItems, newItem];
    });

    setIsCartOpen(true);
  };

  // Remove single item
  const removeFromCart = (cartItemId) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  // Update item quantity
  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  // Update customization details (e.g., editing measurements from cart)
  const updateItemCustomization = (cartItemId, updatedData) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          return {
            ...item,
            ...updatedData,
            tailoringFee: updatedData.isCustomSized ? (item.product.tailoringFee || 350) : 0,
          };
        }
        return item;
      })
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  // Apply Coupon
  const applyCoupon = (code) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'CRAFTLY10' || clean === 'FIRSTCRAFT') {
      setAppliedCoupon({ code: clean, percent: 10 });
      return { success: true, message: 'Coupon applied! 10% discount on cart subtotal.' };
    }
    if (clean === 'ATELIER500') {
      setAppliedCoupon({ code: clean, flatAmount: 500 });
      return { success: true, message: '₹500 Atelier welcome discount applied!' };
    }
    return { success: false, message: 'Invalid coupon code. Try CRAFTLY10' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Calculation helpers
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const tailoringTotal = cartItems.reduce(
    (acc, item) => acc + (item.tailoringFee || 0) * item.quantity,
    0
  );

  // Free shipping above ₹1,499
  const shippingFee = subtotal === 0 ? 0 : subtotal >= 1499 ? 0 : 99;

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.percent) {
      discountAmount = Math.round((subtotal * appliedCoupon.percent) / 100);
    } else if (appliedCoupon.flatAmount) {
      discountAmount = Math.min(appliedCoupon.flatAmount, subtotal);
    }
  }

  const grandTotal = Math.max(0, subtotal + tailoringTotal + shippingFee - discountAmount);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemCustomization,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        tailoringTotal,
        shippingFee,
        discountAmount,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
