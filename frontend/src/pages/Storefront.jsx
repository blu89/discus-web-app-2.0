import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import { useCart } from '../hooks/useCart';
import AddToCartIcon from '../components/AddToCartIcon';

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedToCartId, setAddedToCartId] = useState(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch data when search or category changes
  useEffect(() => {
    fetchData();
  }, [selectedCategory, search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getAll(selectedCategory, search),
        categoryAPI.getAll()
      ]);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    if (product.stock <= 0) {
      alert('This product is out of stock');
      return;
    }
    addToCart(product);
    setAddedToCartId(product.id);
    setTimeout(() => setAddedToCartId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow dark:shadow-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Our Store</h1>
          <div className="mt-4 flex flex-col md:flex-row gap-3 md:gap-4">
            {/* Category Selection Menu */}
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value === '' ? null : e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none dark:focus:ring-blue-400 focus:ring-blue-500 cursor-pointer font-medium transition"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none dark:focus:ring-blue-400 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Categories</h2>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`block w-full text-left px-4 py-2 rounded mb-2 transition ${
              selectedCategory === null ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`block w-full text-left px-4 py-2 rounded mb-2 transition ${
                selectedCategory === category.id ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Loading products...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
                {search || selectedCategory ? 'No products found matching your search or category.' : 'No products available.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition transform hover:-translate-y-1 cursor-pointer border-0"
                >
                  {/* Product Image */}
                  <div className="bg-gray-200 dark:bg-gray-700 h-48 flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 rounded-b-lg"
                      />
                    ) : (
                      <div className="text-4xl">📦</div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-2">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate flex-1">
                        {product.name}
                      </h3>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        ${product.price.toFixed(0)}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                      {product.description || 'No description available'}
                    </p>

                    <div className="flex justify-between items-center mb-3 gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.stock > 0 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product, e);
                        }}
                        disabled={product.stock <= 0}
                        title={addedToCartId === product.id ? 'Added to cart' : product.stock > 0 ? 'Add to cart' : 'Out of stock'}
                        className={`flex-1 py-1 px-2 text-sm rounded-lg font-semibold transition ${
                          addedToCartId === product.id
                            ? 'bg-green-500 text-white'
                            : product.stock > 0
                            ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        {addedToCartId === product.id ? '✓' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
