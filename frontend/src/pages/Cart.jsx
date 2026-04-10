import React from 'react';
import { useCart } from '../hooks/useCart';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Your Cart is Empty</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
      <div className="max-w-screen-lg mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cart.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow dark:shadow-gray-700 mb-4 flex justify-between items-center transition">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{item.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">${item.price.toFixed(0)}</p>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                  />
                  <p className="w-20 text-right font-bold text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(0)}</p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700 sticky top-4 transition">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Order Summary</h2>
              <div className="mb-4 border-t border-b dark:border-gray-700 py-4">
                <div className="flex justify-between mb-2 text-gray-900 dark:text-gray-100">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(0)}</span>
                </div>
                <div className="flex justify-between mb-2 text-gray-900 dark:text-gray-100">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-lg mb-6 text-gray-900 dark:text-white">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
