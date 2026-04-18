import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Helper function to parse sizes
  const parseSizes = (sizes) => {
    if (!sizes) return null;
    if (Array.isArray(sizes)) return sizes;
    if (typeof sizes === 'string') {
      try {
        return JSON.parse(sizes);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const addToCart = (product, size = null) => {
    setCart((prevCart) => {
      // For products with sizes, calculate price based on size
      let itemPrice = product.price;
      const parsedSizes = parseSizes(product.sizes);
      
      if (size && parsedSizes && Array.isArray(parsedSizes)) {
        const sizeObj = parsedSizes.find(s => 
          typeof s === 'object' ? s.size === size : s === size
        );
        if (sizeObj && typeof sizeObj === 'object' && sizeObj.price) {
          itemPrice = sizeObj.price;
        }
      }

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
      
      return [...prevCart, { ...product, quantity: 1, selectedSize: size || null, price: itemPrice }];
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

  const updateSize = (productId, oldSize, newSize) => {
    setCart((prevCart) => {
      // Find the item with the old size
      const itemIndex = prevCart.findIndex(
        item => item.id === productId && item.selectedSize === oldSize
      );
      
      if (itemIndex === -1) return prevCart;
      
      const item = prevCart[itemIndex];
      
      // Find price for new size
      let newPrice = item.price;
      const parsedSizes = parseSizes(item.sizes);
      
      if (newSize && parsedSizes && Array.isArray(parsedSizes)) {
        const sizeObj = parsedSizes.find(s =>
          typeof s === 'object' ? s.size === newSize : s === newSize
        );
        if (sizeObj && typeof sizeObj === 'object' && sizeObj.price) {
          newPrice = sizeObj.price;
        }
      }

      // Check if item with new size already exists
      const existingIndex = prevCart.findIndex(
        item2 => item2.id === productId && item2.selectedSize === newSize
      );

      if (existingIndex !== -1) {
        // Merge quantities
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += item.quantity;
        newCart.splice(itemIndex, 1);
        return newCart;
      }

      // Update size and price
      const newCart = [...prevCart];
      newCart[itemIndex] = { ...item, selectedSize: newSize, price: newPrice };
      return newCart;
    });
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
        updateSize,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
