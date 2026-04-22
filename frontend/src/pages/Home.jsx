import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, heroAPI } from '../services/api';
import { useCart } from '../hooks/useCart';
import AddToCartIcon from '../components/AddToCartIcon';

export default function Home() {
  const [latestProducts, setLatestProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heroImages, setHeroImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [addedToCartId, setAddedToCartId] = useState(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Default hero images if none are set in database
  const defaultHeroImages = [
    {
      id: 1,
      url: 'https://aquariumscience.org/wp-content/uploads/2022/06/Symphysodon-aequifasciatus-Discus-78e.jpg',
      title: 'Best Collection',
      description: 'Discover our Best products'
    },
    {
      id: 2,
      url: 'https://media.architecturaldigest.com/photos/65d4de9f5badec5f2682db2f/master/pass/GettyImages-1076550794.jpg',
      title: 'Welcome to the world of aquarium',
      description: 'Nothing beats the joy of finding the perfect fish for your aquarium'
    },
    {
      id: 3,
      url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcaSJMGHbIoCQ6cJg3TcnrJaLzT-sKVIQ_jg&s',
      title: 'New Arrivals',
      description: 'Check out our newest collections'
    },
    {
      id: 4,
      url: 'https://fpsbutest.wordpress.com/wp-content/uploads/2012/12/untitled24.png?w=960',
      title: 'Special Offers',
      description: 'Limited time deals you cannot miss'
    }
  ];

  useEffect(() => {
    fetchLatestProducts();
    fetchHeroImages();
  }, []);

  useEffect(() => {
    const images = heroImages.length > 0 ? heroImages : defaultHeroImages;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [heroImages]);

  const fetchLatestProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll();
      const products = Array.isArray(response.data) ? response.data : [];
      // Get latest 6 products
      setLatestProducts(products.slice(0, 6));
      // Set featured products (6-12, or next batch after latest if available)
      const featured = products.length > 6 ? products.slice(6, 12) : products.slice(0, 4);
      setFeaturedProducts(featured);
      setError('');
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load latest products');
    } finally {
      setLoading(false);
    }
  };

  const fetchHeroImages = async () => {
    try {
      const response = await heroAPI.getAll();
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setHeroImages(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch hero images:', err);
      // Use default images on error
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    const images = heroImages.length > 0 ? heroImages : defaultHeroImages;
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    const images = heroImages.length > 0 ? heroImages : defaultHeroImages;
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
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
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
      {/* Hero Section with Image Carousel */}
      <section className="relative w-full h-64 md:h-96 overflow-hidden">
        {/* Slides Container */}
        <div className="relative w-full h-full">
          {(heroImages.length > 0 ? heroImages : defaultHeroImages).map((image, index) => (
            <div
              key={image.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover rounded-b-lg"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              
              {/* Text Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-2xl font-bold mb-4">{image.title}</h1>
                  <p className="text-xl mb-8">{image.description}</p>
                  <a href="/storefront" className="bg-white dark:bg-gray-200 text-blue-500 dark:text-blue-700 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-300 inline-block transition">
                    Shop Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Previous Button */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 hover:bg-white dark:text-blue-400 dark:hover:bg-gray-700 p-1 rounded-full shadow-lg transition z-10"
          aria-label="Previous slide"
        >
          &#10094;
        </button>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 hover:bg-white dark:text-blue-400 dark:hover:bg-gray-700 p-1 rounded-full shadow-lg transition z-10"
          aria-label="Next slide"
        >
          &#10095;
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {(heroImages.length > 0 ? heroImages : defaultHeroImages).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-1 h-1 rounded-full transition ${
                index === currentSlide
                  ? 'bg-white'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      

      {/* Latest Products Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">Latest Products</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12">Check out our newest arrivals</p>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded mb-8 text-center">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading products...</p>
            </div>
          ) : latestProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
              {latestProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition transform hover:-translate-y-1 cursor-pointer border-0"
                  onClick={() => navigate('/storefront', { state: { productId: product.id } })}
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
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate flex-1">
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
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={product.stock <= 0}
                        title={addedToCartId === product.id ? 'Added to cart' : product.stock > 0 ? 'Add to cart' : 'Out of stock'}
                        className={`w-10 h-10 rounded-full transition transform hover:scale-110 active:scale-95 flex items-center justify-center ${
                          addedToCartId === product.id
                            ? 'bg-green-500 text-white'
                            : product.stock > 0
                            ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <AddToCartIcon isAdded={addedToCartId === product.id} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No products available yet</p>
            </div>
          )}

          {latestProducts.length > 0 && (
            <div className="text-center">
              <a 
                href="/storefront" 
                className="inline-block bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition"
              >
                View All Products
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">Featured Products</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-12">Handpicked selection of our best products</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition transform hover:-translate-y-1 cursor-pointer border-0"
                  onClick={() => navigate('/storefront', { state: { productId: product.id } })}
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 rounded-b-lg"
                      />
                    ) : (
                      <div className="text-4xl">📦</div>
                    )}
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      ⭐ Featured
                    </div>
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
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={product.stock <= 0}
                        title={addedToCartId === product.id ? 'Added to cart' : product.stock > 0 ? 'Add to cart' : 'Out of stock'}
                        className={`w-10 h-10 rounded-full transition transform hover:scale-110 active:scale-95 flex items-center justify-center ${
                          addedToCartId === product.id
                            ? 'bg-green-500 text-white'
                            : product.stock > 0
                            ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <AddToCartIcon isAdded={addedToCartId === product.id} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <a 
                href="/storefront" 
                className="inline-block bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition"
              >
                Shop All Featured
              </a>
            </div>
          </div>
        </section>
      )}
      {/* About Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">About Charles Discus</h2>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Our mission is simple: to make online shopping convenient, affordable, and enjoyable. We partner with trusted suppliers and carefully curate our inventory to ensure you always get the best value for your money.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500 dark:bg-blue-600 text-white">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Wide Selection</h3>
                    <p className="text-gray-600 dark:text-gray-400">Browse thousands of quality products across multiple categories</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500 dark:bg-blue-600 text-white">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Best Prices</h3>
                    <p className="text-gray-600 dark:text-gray-400">Competitive pricing with regular discounts and special offers</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500 dark:bg-blue-600 text-white">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Expert Support</h3>
                    <p className="text-gray-600 dark:text-gray-400">Dedicated customer service team ready to help anytime</p>
                  </div>
                </div>
              </div>
              <a 
                href="/about" 
                className="inline-block bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition"
              >
                Learn More About Us
              </a>
            </div>

            {/* Image/Visual */}
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-br from-blue-100 dark:from-blue-900 to-purple-100 dark:to-purple-900 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">🛍️</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Shopping Destination</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Quality products, fast shipping, and exceptional service since day one.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-700 text-center transition">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Fast Service</h3>
              <p className="text-gray-600 dark:text-gray-400">Get served instantly at our location or Delivery across over 90+ Countries.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-700 text-center transition">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Secure Checkout</h3>
              <p className="text-gray-600 dark:text-gray-400">100% secure payment processing with SSL encryption.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-700 text-center transition">
              <div className="text-4xl mb-4">💯</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Quality Guarantee</h3>
              <p className="text-gray-600 dark:text-gray-400">6 months guarantee on all products.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <style>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-100%);
            }
          }
          
          .carousel-container {
            overflow: hidden;
            position: relative;
          }
          
          .carousel-track {
            display: flex;
            animation: scroll 30s linear infinite;
            width: fit-content;
          }
          
          .carousel-track:hover {
            animation-play-state: paused;
          }
          
          .carousel-item {
            flex-shrink: 0;
            width: 150px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}</style>
        
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">Our Partners</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 text-lg">Trusted by leading companies worldwide</p>
          
          <div className="carousel-container">
            <div className="carousel-track">
              {/* Duplicate partners for infinite scroll effect */}
              {[
                { name: 'GitHub', url: 'https://cdn.brandfetch.io/domain/fedex.com/w/800/h/220/logo?c=1id8kHc3uuXX97EQ94d' },
                { name: 'Stripe', url: 'https://cdn.brandfetch.io/domain/apple.com?c=1id8kHc3uuXX97EQ94d' },
                { name: 'AWS', url: 'https://cdn.brandfetch.io/domain/ups.com/w/800/h/952/logo?c=1id8kHc3uuXX97EQ94d' },
                { name: 'Google', url: 'https://logos-download.com/wp-content/uploads/2016/09/Google_logo.png' },
                { name: 'Microsoft', url: 'https://logos-download.com/wp-content/uploads/2016/09/Microsoft_logo.png' },
                { name: 'Facebook', url: 'https://logos-download.com/wp-content/uploads/2016/09/Facebook_logo.png' }
              ].map((partner, idx) => (
                <div key={idx} className="carousel-item">
                  <img
                    src={partner.url}
                    alt={partner.name}
                    className="max-h-16 max-w-28 object-contain grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer"
                  />
                </div>
              ))}
              {/* Duplicate partners again for seamless loop */}
              {[
                { name: 'GitHub', url: 'https://logos-download.com/wp-content/uploads/2016/09/GitHub_logo.png' },
                { name: 'Stripe', url: 'https://logos-download.com/wp-content/uploads/2016/09/Stripe_logo.png' },
                { name: 'AWS', url: 'https://logos-download.com/wp-content/uploads/2016/09/AWS_logo.png' },
                { name: 'Google', url: 'https://logos-download.com/wp-content/uploads/2016/09/Google_logo.png' },
                { name: 'Microsoft', url: 'https://logos-download.com/wp-content/uploads/2016/09/Microsoft_logo.png' },
                { name: 'Facebook', url: 'https://logos-download.com/wp-content/uploads/2016/09/Facebook_logo.png' }
              ].map((partner, idx) => (
                <div key={`duplicate-${idx}`} className="carousel-item">
                  <img
                    src={partner.url}
                    alt={partner.name}
                    className="max-h-16 max-w-28 object-contain grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-500 dark:bg-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Shop?</h2>
          <p className="text-xl mb-8">Browse our large selection of products</p>
          <a href="/storefront" className="bg-white dark:bg-gray-200 text-blue-500 dark:text-blue-700 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-300 inline-block transition">
            Start Shopping
          </a>
        </div>
      </section>
    </div>
  );
}
