import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { productAPI, categoryAPI, orderAPI } from '../services/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    categories: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch products
      let products = [];
      try {
        const productsRes = await productAPI.getAll();
        products = Array.isArray(productsRes.data) ? productsRes.data : [];
      } catch (err) {
        console.error('Error fetching products:', err);
        products = [];
      }
      
      // Fetch categories
      let categories = [];
      try {
        const categoriesRes = await categoryAPI.getAll();
        categories = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
      } catch (err) {
        console.error('Error fetching categories:', err);
        categories = [];
      }
      
      // Fetch orders
      let orders = [];
      try {
        const ordersRes = await orderAPI.getAll();
        orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      } catch (err) {
        console.error('Error fetching orders:', err);
        orders = [];
      }
      
      // Calculate revenue from delivered orders
      const revenue = orders
        .filter(order => order.status === 'delivered')
        .reduce((total, order) => total + (parseFloat(order.total_price) || 0), 0);

      // Calculate total stock from all products
      const totalStock = products.reduce((total, product) => total + (parseInt(product.stock) || 0), 0);

      setStats({
        products: totalStock,
        orders: orders.length,
        categories: categories.length,
        revenue: revenue,
      });

      // Get recent orders (last 5)
      setRecentOrders(orders.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block">
          <div className="text-gray-600 dark:text-gray-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.full_name}!</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Here's what's happening with your store today</p>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchDashboardData}
            className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Products Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 dark:text-blue-200 text-sm font-medium">Total Products in Stock</p>
              <p className="text-4xl font-bold mt-2">{stats.products}</p>
            </div>
            <div className="text-5xl opacity-20">📦</div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 dark:text-green-200 text-sm font-medium">Total Orders</p>
              <p className="text-4xl font-bold mt-2">{stats.orders}</p>
            </div>
            <div className="text-5xl opacity-20">📋</div>
          </div>
        </div>

        {/* Categories Card */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-700 dark:to-yellow-800 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 dark:text-yellow-200 text-sm font-medium">Total Categories</p>
              <p className="text-4xl font-bold mt-2">{stats.categories}</p>
            </div>
            <div className="text-5xl opacity-20">🏷️</div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-700 dark:to-purple-800 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 dark:text-purple-200 text-sm font-medium">Revenue (Delivered)</p>
              <p className="text-4xl font-bold mt-2">${stats.revenue.toFixed(0)}</p>
            </div>
            <div className="text-5xl opacity-20">💰</div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      {recentOrders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-700 overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Order ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{order.customer_name}</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600 dark:text-green-400">
                      ${parseFloat(order.total_price).toFixed(0)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                        order.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                        order.status === 'shipped' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400' :
                        order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Admin Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Full Name</p>
              <p className="font-semibold text-lg text-gray-900 dark:text-white">{user?.full_name}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Email Address</p>
              <p className="font-semibold text-lg text-gray-900 dark:text-white">{user?.email}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Role</p>
              <p className="font-semibold text-lg capitalize bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 w-fit px-3 py-1 rounded">
                {user?.role}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Quick Tips</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li> Manage products and keep inventory updated</li>
            <li> Track order status and update customers</li>
            <li> Organize products with categories</li>
            <li> Monitor your revenue and sales</li>
            <li> Use the dashboard to manage your store</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
