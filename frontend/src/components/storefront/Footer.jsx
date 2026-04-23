import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Charles Discus</h3>
            <p className="text-gray-400 dark:text-gray-500">Your most renowned discus breeder across the globe.</p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="text-gray-400 dark:text-gray-500 space-y-2">
              <li><a href="/" className="hover:text-white dark:hover:text-gray-300 transition">Home</a></li>
              <li><a href="/storefront" className="hover:text-white dark:hover:text-gray-300 transition">Shop</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="text-gray-400 dark:text-gray-500 space-y-2">
          
              <li><a href="/contact" className="hover:text-white dark:hover:text-gray-300 transition">Contact Us</a></li>
              <li><a href="/term-and-policy" className="hover:text-white dark:hover:text-gray-300 transition">FAQ</a></li>
              <li><a href="/terms-and-policy" className="hover:text-white dark:hover:text-gray-300 transition">Shipping Info</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="text-gray-400 dark:text-gray-500 space-y-2">
              <li><a href="/terms-and-policy" className="hover:text-white dark:hover:text-gray-300 transition">Privacy Policy</a></li>
              <li><a href="/terms-and-policy" className="hover:text-white dark:hover:text-gray-300 transition">Terms of Service</a></li>
              <li><a href="/terms-and-policy" className="hover:text-white dark:hover:text-gray-300 transition">Returns</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 dark:border-gray-800 pt-8 text-center text-gray-400 dark:text-gray-500 transition">
          <p>&copy; {currentYear} Charles Discus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
