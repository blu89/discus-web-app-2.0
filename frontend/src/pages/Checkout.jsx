import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { orderAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { validateCard, formatCardNumber, formatExpiryDate, formatCVV, getCardType } from '../utils/cardValidator';

const SHIPPING_OPTIONS = {
  domestic: [
    { id: 'standard', name: 'Standard Shipping', cost: 5.99, days: '5-7', description: 'Delivery in 5-7 business days (USA)' },
    { id: 'express', name: 'Express Shipping', cost: 14.99, days: '2-3', description: 'Delivery in 2-3 business days (USA)' },
    { id: 'overnight', name: 'Overnight Shipping', cost: 29.99, days: '1', description: 'Next business day delivery (USA)' },
    { id: 'pickup', name: 'Local Pickup', cost: 0, days: '0', description: 'Free pickup at our location' }
  ],
  international: {
    canada: [
      { id: 'intl-canada-standard', name: 'Standard to Canada', cost: 19.99, days: '7-10', description: 'Delivery in 7-10 business days' },
      { id: 'intl-canada-express', name: 'Express to Canada', cost: 39.99, days: '3-5', description: 'Delivery in 3-5 business days' }
    ],
    europe: [
      { id: 'intl-europe-standard', name: 'Standard to Europe', cost: 34.99, days: '10-14', description: 'Delivery in 10-14 business days' },
      { id: 'intl-europe-express', name: 'Express to Europe', cost: 64.99, days: '5-7', description: 'Delivery in 5-7 business days' }
    ],
    uk: [
      { id: 'intl-uk-standard', name: 'Standard to UK', cost: 24.99, days: '8-12', description: 'Delivery in 8-12 business days' },
      { id: 'intl-uk-express', name: 'Express to UK', cost: 49.99, days: '4-6', description: 'Delivery in 4-6 business days' }
    ],
    australia: [
      { id: 'intl-australia-standard', name: 'Standard to Australia', cost: 44.99, days: '12-18', description: 'Delivery in 12-18 business days' },
      { id: 'intl-australia-express', name: 'Express to Australia', cost: 79.99, days: '7-10', description: 'Delivery in 7-10 business days' }
    ],
    asia: [
      { id: 'intl-asia-standard', name: 'Standard to Asia', cost: 39.99, days: '12-16', description: 'Delivery in 12-16 business days' },
      { id: 'intl-asia-express', name: 'Express to Asia', cost: 69.99, days: '6-8', description: 'Delivery in 6-8 business days' }
    ],
    other: [
      { id: 'intl-other-standard', name: 'Standard International', cost: 49.99, days: '14-21', description: 'Delivery in 14-21 business days' },
      { id: 'intl-other-express', name: 'Express International', cost: 84.99, days: '8-12', description: 'Delivery in 8-12 business days' }
    ]
  }
};

const DESTINATION_REGIONS = [
  { id: 'domestic', name: 'United States', flag: '🇺🇸' },
  { id: 'canada', name: 'Canada', flag: '🇨🇦' },
  { id: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
  { id: 'europe', name: 'Europe', flag: '🇪🇺' },
  { id: 'australia', name: 'Australia', flag: '🇦🇺' },
  { id: 'asia', name: 'Asia', flag: '🌏' },
  { id: 'other', name: 'Other', flag: '🌍' }
];

export default function Checkout() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    shippingAddress: '',
    shippingDestination: 'domestic',
    shippingMethod: 'standard',
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

  const getShippingCost = () => {
    const destination = formData.shippingDestination;
    let options = [];
    
    if (destination === 'domestic') {
      options = SHIPPING_OPTIONS.domestic;
    } else {
      options = SHIPPING_OPTIONS.international[destination] || SHIPPING_OPTIONS.international.other;
    }
    
    const option = options.find(opt => opt.id === formData.shippingMethod);
    return option ? option.cost : 0;
  };

  const getAvailableShippingOptions = () => {
    const destination = formData.shippingDestination;
    
    if (destination === 'domestic') {
      return SHIPPING_OPTIONS.domestic;
    } else {
      return SHIPPING_OPTIONS.international[destination] || SHIPPING_OPTIONS.international.other;
    }
  };

  const getTotalWithShipping = () => {
    return total + getShippingCost();
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'cardNumber') value = formatCardNumber(value);
    else if (name === 'cardExpiry') value = formatExpiryDate(value);
    else if (name === 'cardCVV') value = formatCVV(value);
    else if (name === 'billingZip') value = value.replace(/\D/g, '');

    // Reset shipping method when destination changes
    if (name === 'shippingDestination') {
      setFormData({ ...formData, [name]: value, shippingMethod: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  const validateAllFields = () => {
    const errors = {};

    // Validate customer name
    if (!formData.customerName || formData.customerName.trim().length < 3) {
      errors.customerName = 'Full name must be at least 3 characters';
    }

    // Validate email
    if (!formData.customerEmail || !formData.customerEmail.includes('@')) {
      errors.customerEmail = 'Please enter a valid email address';
    }

    // Validate shipping address
    if (!formData.shippingAddress || formData.shippingAddress.trim().length < 10) {
      errors.shippingAddress = 'Shipping address must be at least 10 characters';
    }

    // Validate billing address
    if (!formData.billingAddress || formData.billingAddress.trim().length < 10) {
      errors.billingAddress = 'Billing address must be at least 10 characters';
    }

    // Validate billing city
    if (!formData.billingCity || formData.billingCity.trim().length < 2) {
      errors.billingCity = 'City must be at least 2 characters';
    }

    // Validate billing state
    if (!formData.billingState || formData.billingState.trim().length < 2) {
      errors.billingState = 'State/Region must be at least 2 characters';
    }

    // Validate billing zip
    if (!formData.billingZip || formData.billingZip.trim().length < 3) {
      errors.billingZip = 'Postal code must be at least 3 characters';
    }

    // Validate billing country
    if (!formData.billingCountry || formData.billingCountry.trim().length < 2) {
      errors.billingCountry = 'Country must be at least 2 characters';
    }

    return errors;
  };

  const isCardInfoValid = () => {
    return (
      formData.cardNumber.replace(/\s/g, '').length >= 13 &&
      formData.cardName.trim().length >= 3 &&
      /^\d{2}\/\d{2}$/.test(formData.cardExpiry) &&
      formData.cardCVV.length >= 3 &&
      formData.customerName.trim().length >= 3 &&
      formData.customerEmail.includes('@') &&
      formData.shippingAddress.trim().length >= 10 &&
      formData.billingAddress.trim().length >= 10 &&
      formData.billingCity.trim().length >= 2 &&
      formData.billingState.trim().length >= 2 &&
      formData.billingZip.trim().length >= 3 &&
      formData.billingCountry.trim().length >= 2 &&
      Object.keys(validationErrors).length === 0
    );
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors({});

    // Validate all fields first
    const allFieldsErrors = validateAllFields();
    if (Object.keys(allFieldsErrors).length > 0) {
      setValidationErrors(allFieldsErrors);
      setLoading(false);
      return;
    }

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
        shipping_destination: formData.shippingDestination,
        shipping_method: formData.shippingMethod,
        shipping_cost: getShippingCost(),
        total_price: getTotalWithShipping(),
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
                  placeholder="e.g., John Smith"
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition ${validationErrors.customerName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  required
                />
                {validationErrors.customerName && <p className="text-red-500 text-sm mt-1">{validationErrors.customerName}</p>}
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-2 text-gray-900 dark:text-gray-100">Email</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder="e.g., john@example.com"
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition ${validationErrors.customerEmail ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  required
                />
                {validationErrors.customerEmail && <p className="text-red-500 text-sm mt-1">{validationErrors.customerEmail}</p>}
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-2 text-gray-900 dark:text-gray-100">Shipping Address</label>
                <textarea
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  placeholder="e.g., 123 Main Street, Apartment 4B, New York, NY 10001"
                  rows="4"
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition ${validationErrors.shippingAddress ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  required
                />
                {validationErrors.shippingAddress && <p className="text-red-500 text-sm mt-1">{validationErrors.shippingAddress}</p>}
              </div>
            </div>

            {/* Shipping Options Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700 mb-6 transition">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Shipping Destination</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                {DESTINATION_REGIONS.map((region) => (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, shippingDestination: region.id, shippingMethod: '' })}
                    className={`p-3 rounded-lg border-2 transition text-sm font-medium ${
                      formData.shippingDestination === region.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-lg mr-1">{region.flag}</span>
                    {region.name}
                  </button>
                ))}
              </div>

              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Shipping Method</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getAvailableShippingOptions().map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setFormData({ ...formData, shippingMethod: option.id })}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      formData.shippingMethod === option.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={`w-4 h-4 rounded-full border-2 transition ${
                            formData.shippingMethod === option.id
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-gray-900 dark:text-white">{option.name}</p>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {option.cost === 0 ? 'FREE' : `$${option.cost.toFixed(2)}`}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Estimated: {option.days} business day(s)</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            {/* Card Details Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700 mb-6 transition">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Card Details</h2>
                <img src="https://cdn-icons-png.flaticon.com/512/5968/5968382.png" alt="Stripe" className="w-10 h-10" />
              </div>

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
                    type="text"
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
                  placeholder="e.g., 123 Main Street, Apartment 4B"
                  rows="3"
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition ${validationErrors.billingAddress ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  required
                />
                {validationErrors.billingAddress && <p className="text-red-500 text-sm mt-1">{validationErrors.billingAddress}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-medium mb-2 text-gray-900 dark:text-gray-100">City</label>
                  <input
                    type="text"
                    name="billingCity"
                    value={formData.billingCity}
                    onChange={handleChange}
                    placeholder="e.g., New York"
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition ${validationErrors.billingCity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    required
                  />
                  {validationErrors.billingCity && <p className="text-red-500 text-sm mt-1">{validationErrors.billingCity}</p>}
                </div>
                <div>
                  <label className="block font-medium mb-2 text-gray-900 dark:text-gray-100">State/Region</label>
                  <input
                    type="text"
                    name="billingState"
                    value={formData.billingState}
                    onChange={handleChange}
                    placeholder="e.g., NY"
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition ${validationErrors.billingState ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    required
                  />
                  {validationErrors.billingState && <p className="text-red-500 text-sm mt-1">{validationErrors.billingState}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-medium mb-2 text-gray-900 dark:text-gray-100">Postal Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="billingZip"
                    value={formData.billingZip}
                    onChange={handleChange}
                    placeholder="e.g., 10001"
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition ${validationErrors.billingZip ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    required
                  />
                  {validationErrors.billingZip && <p className="text-red-500 text-sm mt-1">{validationErrors.billingZip}</p>}
                </div>
                <div>
                  <label className="block font-medium mb-2 text-gray-900 dark:text-gray-100">Country</label>
                  <input
                    type="text"
                    name="billingCountry"
                    value={formData.billingCountry}
                    onChange={handleChange}
                    placeholder="e.g., United States"
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition ${validationErrors.billingCountry ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    required
                  />
                  {validationErrors.billingCountry && <p className="text-red-500 text-sm mt-1">{validationErrors.billingCountry}</p>}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700 transition">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition"
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
              <span>Subtotal:</span>
              <span>${total.toFixed(0)}</span>
            </div>
            {formData.shippingMethod && (
              <>
                <div className="flex justify-between font-semibold text-sm mt-3 text-gray-700 dark:text-gray-300">
                  <span>Shipping to {DESTINATION_REGIONS.find(r => r.id === formData.shippingDestination)?.name}:</span>
                  <span>${getShippingCost().toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {getAvailableShippingOptions().find(opt => opt.id === formData.shippingMethod)?.name}
                </div>
              </>
            )}
            <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t dark:border-gray-700 text-gray-900 dark:text-white">
              <span>Total:</span>
              <span>${getTotalWithShipping().toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
