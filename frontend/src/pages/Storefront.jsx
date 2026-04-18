import React, { useState, useEffect } from 'react';
import { productAPI, categoryAPI } from '../services/api';
import { useCart } from '../hooks/useCart';
import AddToCartIcon from '../components/AddToCartIcon';

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
  }, [selectedCategory, search]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getAll(selectedCategory, search),
        categoryAPI.getAll()
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize);
    }
    setSelectedProduct(null);
    setQuantity(1);
    setSelectedSize(null);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setSelectedSize(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow dark:shadow-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Our Store</h1>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-4 w-full md:w-1/3 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none dark:focus:ring-blue-400 focus:ring-blue-500"
          />
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
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="bg-white dark:bg-gray-800 rounded-t-lg shadow-lg dark:shadow-gray-700 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-600 transition transform hover:-translate-y-1 cursor-pointer"
                >
                  {/* Product Image */}
                  <div className="bg-gray-200 dark:bg-gray-700 h-48 flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
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
                          addToCart(product);
                        }}
                        disabled={product.stock <= 0}
                        className={`flex-1 py-1 px-2 text-sm rounded-lg font-semibold transition ${
                          product.stock > 0
                          ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
                          : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto transition">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl dark:shadow-gray-700 max-w-2xl w-full my-8 transition">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 dark:from-blue-700 dark:via-blue-700 dark:to-indigo-700 text-white p-8 sm:p-10 flex justify-between items-start rounded-t-3xl transition">
              <div>
                <h2 className="text-4xl font-bold mb-1">{selectedProduct.name}</h2>
                <p className="text-blue-100 dark:text-blue-200 text-sm">View and customize your purchase</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition transform hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 sm:p-10 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Product Image */}
              <div className="flex justify-center">
                <img
                  src={selectedProduct.image_url || 'https://via.placeholder.com/400'}
                  alt={selectedProduct.name}
                  className="w-full max-w-md h-auto rounded-2xl shadow-lg dark:shadow-gray-700"
                />
              </div>

              {/* Product Details */}
              <section className="space-y-5">
                {/* Price */}
                <div className="bg-gradient-to-br from-green-50 dark:from-green-900/30 to-blue-50 dark:to-blue-900/30 p-6 rounded-2xl border border-green-100 dark:border-green-700 transition">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 font-semibold">Price</p>
                  <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 dark:from-green-400 to-blue-600 dark:to-blue-400">${selectedProduct.price.toFixed(0)}</p>
                </div>

                {/* Description */}
                {selectedProduct.description && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl border border-gray-200 dark:border-gray-600 transition">
                    <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Description</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedProduct.description}</p>
                  </div>
                )}

                {/* Stock Status */}
                <div className="bg-gradient-to-br from-gray-50 dark:from-gray-700 to-blue-50 dark:to-blue-900/30 p-6 rounded-2xl border border-blue-100 dark:border-blue-700 transition">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 font-semibold">Stock Available</p>
                  <p className={`text-2xl font-bold ${selectedProduct.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {selectedProduct.stock > 0 ? `✓ ${selectedProduct.stock} items in stock` : '✕ Out of Stock'}
                  </p>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProduct.category_id && (
                    <div className="bg-gradient-to-br from-purple-50 dark:from-purple-900/30 to-purple-100 dark:to-purple-900/50 p-5 rounded-2xl border border-purple-200 dark:border-purple-700 transition">
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 font-semibold">Category</p>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">{selectedProduct.category_id}</p>
                    </div>
                  )}
                  {selectedProduct.product_type_id && (
                    <div className="bg-gradient-to-br from-yellow-50 dark:from-yellow-900/30 to-orange-100 dark:to-orange-900/30 p-5 rounded-2xl border border-yellow-200 dark:border-yellow-700 transition">
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 font-semibold">Type</p>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">{selectedProduct.product_type_id}</p>
                    </div>
                  )}
                </div>

                {/* Product ID */}
                <div className="bg-gray-100 dark:bg-gray-700 p-5 rounded-2xl border border-gray-300 dark:border-gray-600 transition">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 font-semibold">Product ID</p>
                  <p className="font-mono text-xs text-gray-700 dark:text-gray-300 break-all bg-white dark:bg-gray-800 p-2 rounded-lg transition">{selectedProduct.name}</p>
                </div>

                {/* Size Selector */}
                {selectedProduct.sizes && JSON.parse(selectedProduct.sizes).length > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 dark:from-purple-900/30 to-purple-100 dark:to-purple-900/50 p-6 rounded-2xl border border-purple-200 dark:border-purple-700 transition">
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 font-bold">Available Sizes</p>
                    <div className="flex flex-wrap gap-3">
                      {JSON.parse(selectedProduct.sizes).map((sizeItem) => {
                        const sizeObj = typeof sizeItem === 'object' ? sizeItem : { size: sizeItem, price: selectedProduct.price };
                        return (
                          <button
                            key={sizeObj.size}
                            onClick={() => setSelectedSize(sizeObj.size)}
                            className={`px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 active:scale-95 ${
                              selectedSize === sizeObj.size
                                ? 'bg-purple-600 dark:bg-purple-700 text-white shadow-lg'
                                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-purple-300 dark:border-purple-600 hover:border-purple-500 dark:hover:border-purple-500'
                            }`}
                          >
                            <div className="text-center">
                              <div>{sizeObj.size}</div>
                              <div className="text-xs mt-1">${sizeObj.price.toFixed(0)}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {selectedSize && (
                      <p className="mt-3 text-sm text-purple-700 dark:text-purple-300 font-semibold">✓ Selected: {selectedSize}</p>
                    )}
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="bg-gradient-to-br from-blue-50 dark:from-blue-900/30 to-blue-100 dark:to-blue-900/50 p-6 rounded-2xl border border-blue-200 dark:border-blue-700 transition">
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 font-bold">Quantity Selection</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={selectedProduct.stock <= 0}
                      className="bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 disabled:opacity-50 text-gray-800 dark:text-white font-bold py-2 px-5 rounded-xl transition transform hover:scale-105 active:scale-95"
                    >
                      −
                    </button>
                    <div className="flex-1 text-center bg-white dark:bg-gray-700 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-700 transition">
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{quantity}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">of {selectedProduct.stock}</p>
                    </div>
                    <button
                      onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                      disabled={selectedProduct.stock <= 0 || quantity >= selectedProduct.stock}
                      className="bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 disabled:opacity-50 text-gray-800 dark:text-white font-bold py-2 px-5 rounded-xl transition transform hover:scale-105 active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 transition">
                <button
                  onClick={() => handleAddToCart(selectedProduct)}
                  disabled={selectedProduct.stock <= 0}
                  title={selectedProduct.stock > 0 ? `Add to Cart (Qty: ${quantity})` : 'Out of Stock'}
                  className={`w-14 h-14 rounded-full transition transform hover:scale-110 active:scale-95 shadow-md flex items-center justify-center ${
                    selectedProduct.stock > 0
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white cursor-pointer'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <AddToCartIcon isAdded={false} />
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-4 px-4 rounded-xl transition transform hover:scale-105 active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
