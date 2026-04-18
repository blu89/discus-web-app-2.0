import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product, size = null) => {
    setCart((prevCart) => {
      // Create unique key for product+size combination
      const itemKey = size ? `${product.id}-${size}` : product.id;
      const existing = prevCart.find((item) => 
        size ? (item.id === product.id && item.selectedSize === size) : (item.id === product.id && !item.selectedSize)
      );
      
      if (existing) {
        return prevCart.map((item) =>
          (size ? (item.id === product.id && item.selectedSize === size) : (item.id === product.id && !item.selectedSize))
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prevCart, { ...product, quantity: 1, selectedSize: size || null }];
    });
  };

  const removeFromCart = (productId, selectedSize = null) => {
    setCart((prevCart) => 
      prevCart.filter((item) => 
        selectedSize 
          ? !(item.id === productId && item.selectedSize === selectedSize)
          : !(item.id === productId && !item.selectedSize)
      )
    );
  };

  const updateQuantity = (productId, quantity, selectedSize = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          (selectedSize 
            ? (item.id === productId && item.selectedSize === selectedSize)
            : (item.id === productId && !item.selectedSize))
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
