import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { orderAPI } from '../services/api';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderAPI.getById(orderId);
        setOrder(response.data);
      } catch (error) {
        console.error('Failed to fetch order', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleResendEmail = async () => {
    setResending(true);
    setResendMessage('');
    setResendError('');
    
    try {
      const response = await orderAPI.resendConfirmationEmail(orderId);
      setResendMessage('Confirmation email resent successfully! Check your inbox.');
      setTimeout(() => setResendMessage(''), 5000);
    } catch (error) {
      setResendError(error.response?.data?.error || 'Failed to resend email. Please try again.');
      console.error('Failed to resend confirmation email', error);
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-white dark:bg-gray-950 text-center py-12 text-gray-900 dark:text-white transition-colors duration-200">Loading...</div>;
  }

  if (!order) {
    return <div className="min-h-screen bg-white dark:bg-gray-950 text-center py-12 text-gray-900 dark:text-white transition-colors duration-200">Order not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
      <div className="max-w-screen-md mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-700 p-8 text-center transition">
          <div className="text-6xl text-green-500 dark:text-green-400 mb-4">✓</div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Order Confirmed!</h1>
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Payment pending</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Thank you for your purchase.</p>

          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-8 text-left transition">
            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400">Order ID</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{order.id}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400">Customer Name</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{order.customer_name}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400">Email</p>
              <p className="text-lg text-gray-900 dark:text-gray-100">{order.customer_email}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="text-2xl font-bold text-blue-500 dark:text-blue-400">${order.total_price.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Status</p>
              <p className="text-lg font-bold capitalize text-gray-900 dark:text-white">{order.status}</p>
            </div>
          </div>

          {resendMessage && (
            <div className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200 p-4 rounded-lg mb-4 border border-green-200 dark:border-green-700 transition">
              {resendMessage}
            </div>
          )}

          {resendError && (
            <div className="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg mb-4 border border-red-200 dark:border-red-700 transition">
              {resendError}
            </div>
          )}

          <div className="flex gap-4 justify-center mb-4">
            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="bg-purple-500 dark:bg-purple-600 hover:bg-purple-600 dark:hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? 'Resending...' : 'Resend Confirmation Email'}
            </button>
            <a href="/" className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block transition">
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
