import React, { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll();
      console.log('OrderManagement fetchOrders full response:', response);
      console.log('Response.data:', response.data);
      console.log('Response.data type:', typeof response.data);
      console.log('Response.data is array?', Array.isArray(response.data));
      
      // Handle different response formats
      let ordersData = response.data;
      if (typeof ordersData === 'object' && ordersData !== null && !Array.isArray(ordersData)) {
        // If response.data is an object (not array), try to extract orders array
        if (ordersData.orders && Array.isArray(ordersData.orders)) {
          ordersData = ordersData.orders;
        } else if (ordersData.data && Array.isArray(ordersData.data)) {
          ordersData = ordersData.data;
        }
      }
      
      const finalOrders = Array.isArray(ordersData) ? ordersData : [];
      console.log('Final orders to display:', finalOrders);
      setOrders(finalOrders);
      
      if (finalOrders.length === 0) {
        console.warn('No orders returned from API');
      }
    } catch (err) {
      console.error('OrderManagement fetchOrders error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(`Failed to fetch orders: ${err.message}`);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    setDetailsLoading(true);
    try {
      const response = await orderAPI.getById(orderId);
      setOrderDetails(response.data);
      setSelectedOrder(orderId);
    } catch (err) {
      setError('Failed to fetch order details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      fetchOrders();
      if (selectedOrder === orderId) {
        fetchOrderDetails(orderId);
      }
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    setResendMessage('');
    setResendError('');
    
    try {
      const response = await orderAPI.resendConfirmationEmail(selectedOrder);
      setResendMessage('Confirmation email resent successfully!');
      setTimeout(() => setResendMessage(''), 5000);
    } catch (err) {
      setResendError(err.response?.data?.error || 'Failed to resend email. Please try again.');
      console.error('Failed to resend confirmation email', err);
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-900 dark:text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6 transition-colors duration-200">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Orders</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage all customer orders</p>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg transition">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 overflow-x-auto transition">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Order ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Customer</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">IP Address</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Total</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">{order.id.slice(0, 8)}...</td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{order.customer_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{order.customer_email}</td>
                <td className="px-6 py-4 text-sm font-mono text-blue-600 dark:text-blue-400">{order.ip_address || 'N/A'}</td>
                <td className="px-6 py-4 text-sm font-bold text-green-600 dark:text-green-400">${order.total_price.toFixed(0)}</td>
                <td className="px-6 py-4 text-sm">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    className={`px-3 py-1 rounded border font-medium transition ${
                      order.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200' :
                      order.status === 'processing' ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-200' :
                      order.status === 'shipped' ? 'bg-purple-50 dark:bg-purple-900 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-200' :
                      order.status === 'delivered' ? 'bg-green-50 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-700 dark:text-green-200' :
                      'bg-red-50 dark:bg-red-900 border-red-300 dark:border-red-700 text-red-700 dark:text-red-200'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => fetchOrderDetails(order.id)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium hover:underline transition"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No orders found
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto transition">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-700 max-w-2xl w-full my-8 transition">
            {detailsLoading ? (
              <div className="p-8 text-center text-gray-900 dark:text-white">Loading order details...</div>
            ) : orderDetails ? (
              <>
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white p-6 sm:p-8 flex justify-between items-start transition">
                  <div>
                    <h2 className="text-2xl font-bold">Order Details</h2>
                    <p className="text-blue-100 dark:text-blue-200 mt-1 font-mono">{selectedOrder}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOrder(null);
                      setOrderDetails(null);
                    }}
                    className="text-2xl hover:opacity-75 transition"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 sm:p-8 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {/* Customer Info */}
                  <section>
                    <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Customer Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{orderDetails.customer_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{orderDetails.customer_email}</p>
                      </div>
                      {orderDetails.ip_address && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">IP Address</p>
                          <p className="font-mono text-sm text-blue-600 dark:text-blue-400">{orderDetails.ip_address}</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Shipping Info */}
                  <section>
                    <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Shipping Address</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition">
                      <p className="font-semibold text-gray-900 dark:text-white">{orderDetails.shipping_address}</p>
                    </div>
                  </section>

                  {/* Card Details */}
                  {orderDetails.card_name && (
                    <section>
                      <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Payment Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Cardholder Name</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{orderDetails.card_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Card Number</p>
                          <p className="font-semibold text-gray-900 dark:text-white font-mono">{orderDetails.card_number}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Expiry Date</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{orderDetails.card_expiry}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">CVV</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{orderDetails.card_cvv}</p>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Billing Address */}
                  {orderDetails.billing_address && (
                    <section>
                      <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Billing Address</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition">
                        <div className="sm:col-span-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{orderDetails.billing_address}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">City</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{orderDetails.billing_city}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">State/Region</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{orderDetails.billing_state}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Postal Code</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{orderDetails.billing_zip}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Country</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{orderDetails.billing_country}</p>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Order Items */}
                  {orderDetails.order_items && orderDetails.order_items.length > 0 && (
                    <section>
                      <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Order Items</h3>
                      <div className="space-y-2 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden transition">
                        <table className="w-full">
                          <thead className="bg-gray-200 dark:bg-gray-600">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Product</th>
                              <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900 dark:text-white">Qty</th>
                              <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900 dark:text-white">Price</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y dark:divide-gray-600">
                            {orderDetails.order_items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.product_id}</td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">{item.quantity}</td>
                                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-gray-100">${item.price.toFixed(0)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  {/* Order Summary */}
                  <section>
                    <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Order Summary</h3>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg space-y-2 transition">
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Total Price:</span>
                        <span className="font-bold text-xl text-green-600 dark:text-green-400">${orderDetails.total_price.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-500">
                        <span className="text-gray-700 dark:text-gray-300">Status:</span>
                        <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                          orderDetails.status === 'pending' ? 'bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                          orderDetails.status === 'processing' ? 'bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                          orderDetails.status === 'shipped' ? 'bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                          orderDetails.status === 'delivered' ? 'bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200' :
                          'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}>
                          {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {resendMessage && (
                      <div className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200 p-4 rounded-lg border border-green-200 dark:border-green-700 transition">
                        {resendMessage}
                      </div>
                    )}
                    
                    {resendError && (
                      <div className="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg border border-red-200 dark:border-red-700 transition">
                        {resendError}
                      </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                      <button
                        onClick={handleResendEmail}
                        disabled={resending}
                        className="flex-1 bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-600 text-white font-bold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resending ? 'Resending...' : 'Resend Email'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(null);
                          setOrderDetails(null);
                          setResendMessage('');
                          setResendError('');
                        }}
                        className="flex-1 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold py-2 rounded-lg transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-red-600 dark:text-red-400">
                Failed to load order details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
