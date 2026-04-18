import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { orderAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { validateCard, formatCardNumber, formatExpiryDate, formatCVV, getCardType } from '../utils/cardValidator';

export default function Checkout() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    shippingAddress: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCVV: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'cardNumber') value = formatCardNumber(value);
    else if (name === 'cardExpiry') value = formatExpiryDate(value);
    else if (name === 'cardCVV') value = formatCVV(value);

    setFormData({ ...formData, [name]: value });

    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors({});

    const cardValidation = validateCard(formData);
    if (!cardValidation.isValid) {
      setValidationErrors(cardValidation.errors);
      setLoading(false);
      return;
    }

    try {
      const orderItems = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const response = await orderAPI.create({
        items: orderItems,
        customer_email: formData.customerEmail,
        customer_name: formData.customerName,
        shipping_address: formData.shippingAddress,
        total_price: total,
        card_number: formData.cardNumber,
        card_name: formData.cardName,
        card_expiry: formData.cardExpiry,
        card_cvv: formData.cardCVV,
        billing_address: formData.billingAddress,
        billing_city: formData.billingCity,
        billing_state: formData.billingState,
        billing_zip: formData.billingZip,
        billing_country: formData.billingCountry
      });

      clearCart();
      navigate(`/order-confirmation/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Checkout</h1>

        {error && <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded mb-6 transition">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={handleCheckout}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700 mb-6 transition">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Shipping Information</h2>

              <div className="mb-4">
                <label className="block font-medium mb-2 text-gray-900 dark:text-gray-100">Full Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-2 text-gray-900 dark:text-gray-100">Email</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-2 text-gray-900 dark:text-gray-100">Shipping Address</label>
                <textarea
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                  required
                />
              </div>
            </div>

            {/* Card Details Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700 mb-6 transition">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Card Details</h2>

              <div className="mb-4">
                <label className="block font-medium mb-2 text-gray-900 dark:text-gray-100">Cardholder Name</label>
                <input
                  type="text"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition ${validationErrors.cardName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  placeholder="John Doe"
                  required
                />
                {validationErrors.cardName && <p className="text-red-500 text-sm mt-1">{validationErrors.cardName}</p>}
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-2 text-gray-900 dark:text-gray-100">Card Number {formData.cardNumber && <span className="text-xs text-gray-500">({getCardType(formData.cardNumber)})</span>}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition ${validationErrors.cardNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                />
                {validationErrors.cardNumber && <p className="text-red-500 text-sm mt-1">{validationErrors.cardNumber}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-medium mb-2 text-gray-900 dark:text-gray-100">Expiry Date</label>
                  <input
                    type="text"
                    name="cardExpiry"
                    value={formData.cardExpiry}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition ${validationErrors.cardExpiry ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                  {validationErrors.cardExpiry && <p className="text-red-500 text-sm mt-1">{validationErrors.cardExpiry}</p>}
                </div>
                <div>
                  <label className="block font-medium mb-2 text-gray-900 dark:text-gray-100">CVV</label>
                  <input
                    type="password"
                    name="cardCVV"
                    value={formData.cardCVV}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition ${validationErrors.cardCVV ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                  {validationErrors.cardCVV && <p className="text-red-500 text-sm mt-1">{validationErrors.cardCVV}</p>}
                </div>
              </div>
            </div>

            {/* Billing Address Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700 mb-6 transition">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Billing Address</h2>

              <div className="mb-4">
                <label className="block font-medium mb-2 text-gray-900 dark:text-gray-100">Address</label>
                <textarea
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                  placeholder="Street address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-medium mb-2 text-gray-900 dark:text-gray-100">City</label>
                  <input
                    type="text"
                    name="billingCity"
                    value={formData.billingCity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2 text-gray-900 dark:text-gray-100">State/Region</label>
                  <input
                    type="text"
                    name="billingState"
                    value={formData.billingState}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-medium mb-2 text-gray-900 dark:text-gray-100">Postal Code</label>
                  <input
                    type="text"
                    name="billingZip"
                    value={formData.billingZip}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2 text-gray-900 dark:text-gray-100">Country</label>
                  <input
                    type="text"
                    name="billingCountry"
                    value={formData.billingCountry}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700 transition">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white py-3 rounded-lg font-bold disabled:opacity-50 transition"
              >
                {loading ? 'Processing...' : 'Complete Order'}
              </button>
            </div>
          </form>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700 h-fit sticky top-4 transition">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Order Summary</h2>
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 mb-4 pb-4 border-b dark:border-gray-700">
                {/* Product Image Thumbnail */}
                <div className="flex-shrink-0">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-lg">
                      📦
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                  {item.selectedSize && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">Size: {item.selectedSize}</p>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">${item.price.toFixed(0)} each</p>
                </div>

                <div className="flex-shrink-0 text-right">
                  <p className="font-bold text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(0)}</p>
                </div>
              </div>
            ))}
            <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t dark:border-gray-700 text-gray-900 dark:text-white">
              <span>Total:</span>
              <span>${total.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
