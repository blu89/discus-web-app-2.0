import React from 'react';

export default function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">About Kanye West</h1>
          <p className="text-xl">Your trusted destination for quality products</p>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">Our Story</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg leading-relaxed">
                Founded in 2020, Kanye West started with a simple mission: to provide customers with high-quality products at affordable prices. What began as a small startup has grown into a thriving e-commerce platform serving thousands of satisfied customers worldwide.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg leading-relaxed">
                We believe in putting our customers first. Every product in our catalog is carefully selected and quality-tested to ensure you receive the best value for your money. Our dedicated team works tirelessly to improve your shopping experience every day.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                Today, we're proud to be a trusted brand that customers recommend to their friends and family. We're committed to continuous innovation and sustainable business practices.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-purple-500 dark:from-blue-600 dark:to-purple-700 rounded-lg p-8 text-white text-center">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-2xl font-bold mb-4">Building Trust Since 2020</h3>
              <p className="text-lg opacity-90">Serving customers with integrity and excellence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">Our Mission & Vision</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-700">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Our Mission</h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                To provide customers with a seamless, trustworthy, and enjoyable online shopping experience by offering a curated selection of quality products, exceptional customer service, and competitive prices.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-700">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Our Vision</h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                To become the most trusted and customer-centric online marketplace, recognized for our commitment to quality, innovation, and sustainability. We aim to empower businesses and delight customers globally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-700 text-center">
              <div className="text-5xl mb-4">💎</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Quality</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We never compromise on quality. Every product meets our strict standards.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-700 text-center">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Integrity</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We conduct business with honesty and transparency in all dealings.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-700 text-center">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Excellence</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We strive for excellence in everything we do, every single day.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-700 text-center">
              <div className="text-5xl mb-4">🌱</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Sustainability</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We're committed to environmental responsibility and sustainable practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">Why Choose Kanye West?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="text-4xl">✓</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Curated Selection</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Hand-picked products that meet our quality standards
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-4xl">✓</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Fast Shipping</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Quick delivery to get your products when you need them
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-4xl">✓</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Secure Checkout</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  SSL encryption ensures your payment information is safe
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-4xl">✓</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Customer Support</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Dedicated team ready to help with any questions
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-4xl">✓</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Money-Back Guarantee</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  30-day guarantee on all products, no questions asked
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-4xl">✓</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Competitive Prices</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Best value for your money with regular discounts
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Our Dedicated Team</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
            We have a passionate team of professionals committed to delivering excellence
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-700">
              <div className="text-6xl mb-4">👨‍💼</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Leadership</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Experienced leaders guiding our vision and strategy
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-700">
              <div className="text-6xl mb-4">👩‍💻</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Development</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Talented engineers building our platform
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-700">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Customer Care</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Support specialists ensuring customer satisfaction
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-500 dark:bg-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl mb-8">Start shopping with Kanye West today and experience the difference</p>
          <a 
            href="/storefront" 
            className="bg-white dark:bg-gray-200 text-blue-500 dark:text-blue-700 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-300 inline-block transition"
          >
            Shop Now
          </a>
        </div>
      </section>
    </div>
  );
}
