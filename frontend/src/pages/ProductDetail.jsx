import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../hooks/useCart';
import ReviewForm from '../components/ReviewForm';
import ReviewCard from '../components/ReviewCard';
import axios from 'axios';

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hoveredImageIndex, setHoveredImageIndex] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Get all images (primary image + any additional ones)
  const getGalleryImages = () => {
    const images = [];
    
    // Add primary image first
    if (product?.image_url) {
      images.push(product.image_url);
    }
    
    // Add additional images
    if (product?.additional_images) {
      try {
        let additionalImages = [];
        
        // Try parsing if it's a JSON string
        if (typeof product.additional_images === 'string') {
          additionalImages = JSON.parse(product.additional_images);
        } else if (Array.isArray(product.additional_images)) {
          additionalImages = product.additional_images;
        }
        
        // Add each additional image
        if (Array.isArray(additionalImages)) {
          additionalImages.forEach(img => {
            const imageUrl = typeof img === 'string' ? img : img.url;
            if (imageUrl) {
              images.push(imageUrl);
            }
          });
        }
      } catch (e) {
        console.error('Error parsing additional images:', e);
      }
    }
    
    return images;
  };

  const galleryImages = product ? getGalleryImages() : [];


  useEffect(() => {
    if (product?.id) {
      fetchReviews();
      fetchRelatedProducts();
    }
  }, [product?.id]);
  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // Since there's no getById endpoint, we'll fetch all and find the one we need
      const response = await productAPI.getAll();
      const products = Array.isArray(response.data) ? response.data : [];
      const found = products.find(p => p.id === productId);
      
      if (found) {
        setProduct(found);
        if (found.sizes && JSON.parse(found.sizes).length > 0) {
          const sizes = JSON.parse(found.sizes);
          const firstSize = typeof sizes[0] === 'object' ? sizes[0].size : sizes[0];
          setSelectedSize(firstSize);
        }
        setError('');
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Failed to fetch product:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await axios.get(`/api/reviews/product/${productId}`, {
        params: { limit: 100 }
      });
      setReviews(response.data.data || []);
      setAverageRating(response.data.averageRating || 0);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      setLoadingRelated(true);
      if (!product?.category_id) {
        setRelatedProducts([]);
        return;
      }
      // Fetch all products in the same category
      const response = await productAPI.getAll(product.category_id);
      const products = Array.isArray(response.data) ? response.data : [];
      // Filter out current product and limit to 4 related products
      const related = products.filter(p => p.id !== productId).slice(0, 4);
      setRelatedProducts(related);
    } catch (err) {
      console.error('Error fetching related products:', err);
      setRelatedProducts([]);
    } finally {
      setLoadingRelated(false);
    }
  };

  const parseSizes = (sizes) => {
    if (!sizes) return [];
    if (Array.isArray(sizes)) return sizes;
    if (typeof sizes === 'string') {
      try {
        return JSON.parse(sizes);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product, selectedSize);
      }
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
      setQuantity(1);
    }
  };

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{error || 'Product not found'}</h1>
          <button
            onClick={() => navigate('/storefront')}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition"
          >
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  const sizes = parseSizes(product.sizes);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/storefront')}
          className="mb-6 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-semibold flex items-center gap-2 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Store
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery Section */}
          <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg dark:shadow-gray-700 cursor-pointer group"
              onClick={() => openLightbox(hoveredImageIndex !== null ? hoveredImageIndex : 0)}
            >
              {galleryImages.length > 0 ? (
                <div className="relative bg-gray-200 dark:bg-gray-700 h-96 flex items-center justify-center overflow-hidden">
                  <img 
                    src={galleryImages[hoveredImageIndex !== null ? hoveredImageIndex : 0]} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-200 dark:bg-gray-700 h-96 flex items-center justify-center text-6xl">
                  📦
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {galleryImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => openLightbox(index)}
                    onMouseEnter={() => setHoveredImageIndex(index)}
                    onMouseLeave={() => setHoveredImageIndex(null)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition transform hover:scale-105 ${
                      hoveredImageIndex === index || currentImageIndex === index
                        ? 'border-blue-500 dark:border-blue-400'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${index}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">Product ID: {product.id}</p>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-br from-green-50 dark:from-green-900/30 to-blue-50 dark:to-blue-900/30 p-6 rounded-lg border border-green-100 dark:border-green-700 transition">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Price</p>
              <p className="text-5xl font-bold text-green-600 dark:text-green-400">${product.price.toFixed(0)}</p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition">
                <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Stock Status */}
            <div className={`p-6 rounded-lg border transition ${
              product.stock > 0
                ? 'bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-700'
            }`}>
              <p className={`text-lg font-bold ${product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {product.stock > 0 ? `✓ ${product.stock} items in stock` : '✕ Out of Stock'}
              </p>
            </div>

            {/* Size Selector */}
            {sizes && sizes.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 dark:from-purple-900/30 to-purple-100 dark:to-purple-900/50 p-6 rounded-lg border border-purple-200 dark:border-purple-700 transition">
                <p className="text-gray-700 dark:text-gray-300 font-bold mb-4">Select Size</p>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((sizeItem) => {
                    const sizeObj = typeof sizeItem === 'object' ? sizeItem : { size: sizeItem, price: product.price };
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
              </div>
            )}

            {/* Quantity Selector */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition">
              <label className="block text-gray-700 dark:text-gray-300 font-bold mb-3">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white font-bold hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 px-4 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white font-bold hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition transform hover:scale-105 active:scale-95 ${
                addedToCart
                  ? 'bg-green-500 dark:bg-green-600'
                  : product.stock > 0
                  ? 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700'
                  : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
              }`}
            >
              {addedToCart ? '✓ Added to Cart' : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>

            {/* Continue Shopping */}
            <button
              onClick={() => navigate('/storefront')}
              className="w-full py-3 px-6 rounded-lg font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && galleryImages.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 transition-all">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition transform hover:scale-110 z-10"
            aria-label="Close lightbox"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Main Image */}
          <div className="relative max-w-5xl max-h-screen flex items-center justify-center">
            <img 
              src={galleryImages[currentImageIndex]} 
              alt={`Gallery ${currentImageIndex}`}
              className="max-w-full max-h-screen object-contain rounded-lg"
            />

            {/* Previous Button */}
            {galleryImages.length > 1 && (
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-3 transition transform hover:scale-110 active:scale-95"
                aria-label="Previous image"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Next Button */}
            {galleryImages.length > 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-3 transition transform hover:scale-110 active:scale-95"
                aria-label="Next image"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Image Counter */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm">
                {currentImageIndex + 1} / {galleryImages.length}
              </div>
            )}
          </div>

          {/* Keyboard Navigation */}
          <div className="absolute bottom-4 left-4 text-white text-xs text-opacity-70">
            Press ESC to close • Arrow keys to navigate
          </div>
        </div>
      )}

      {/* Keyboard Navigation Handler */}
      {lightboxOpen && (
        <div
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft' && galleryImages.length > 1) prevImage();
            if (e.key === 'ArrowRight' && galleryImages.length > 1) nextImage();
          }}
          tabIndex={0}
          autoFocus
        />
      )}

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-200 dark:border-gray-700 mt-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Related Products</h2>
          
          {loadingRelated ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading related products...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div 
                  key={relatedProduct.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-600 transition cursor-pointer"
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                >
                  {/* Product Image */}
                  <div className="relative bg-gray-200 dark:bg-gray-700 h-48 overflow-hidden group">
                    {relatedProduct.image_url ? (
                      <img 
                        src={relatedProduct.image_url} 
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {relatedProduct.description || 'No description available'}
                    </p>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${relatedProduct.price.toFixed(0)}
                      </p>
                      {relatedProduct.stock > 0 ? (
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">
                          In Stock
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-200 dark:border-gray-700 mt-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Customer Reviews</h2>

        {/* Overall Rating */}
        {reviews.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {averageRating}
                </div>
                <div className="text-yellow-400 text-2xl">
                  {'★'.repeat(Math.round(averageRating)) + '☆'.repeat(5 - Math.round(averageRating))}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Review Form */}
        <ReviewForm productId={productId} onReviewSubmitted={fetchReviews} />

        {/* Reviews List */}
        {loadingReviews ? (
          <p className="text-center py-12 text-gray-600 dark:text-gray-400">Loading reviews...</p>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
}
