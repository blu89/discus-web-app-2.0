import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AdminDashboard from '../../pages/AdminDashboard';
import ProductManagement from './ProductManagement';
import HeroManagement from './HeroManagement';
import ProductTypeManagement from './ProductTypeManagement';
import CategoryManagement from './CategoryManagement';
import OrderManagement from './OrderManagement';
import SupplierManagement from './SupplierManagement';

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'hero':
        return <HeroManagement />;
      case 'products':
        return <ProductManagement />;
      case 'product-types':
        return <ProductTypeManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'suppliers':
        return <SupplierManagement />;
      case 'orders':
        return <OrderManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'hero', label: 'Hero Banners', icon: '🖼️' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'product-types', label: 'Product Types', icon: '🏷️' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
    { id: 'suppliers', label: 'Suppliers', icon: '🏭' },
    { id: 'orders', label: 'Orders', icon: '📋' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transform transition-transform duration-300 fixed md:static inset-y-0 left-0 w-64 bg-gradient-to-b from-gray-900 dark:from-gray-950 to-gray-800 dark:to-gray-900 text-white p-6 z-40 overflow-y-auto rounded-r-lg`}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Admin</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition ${
                activeTab === item.id
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-12 pt-8 border-t border-gray-700 space-y-4">
          <div className="px-4">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="font-semibold text-white truncate">{user?.full_name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition text-2xl"
              >
                {sidebarOpen ? '✕' : '☰'}
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                {navItems.find(item => item.id === activeTab)?.label}
              </h1>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto scroll-smooth">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
