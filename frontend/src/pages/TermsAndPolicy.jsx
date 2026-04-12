import React, { useState } from 'react';

export default function TermsAndPolicy() {
  const [activeTab, setActiveTab] = useState('terms');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Terms & Policies</h1>
          <p className="text-xl">Please read our terms and conditions carefully</p>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'terms'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'privacy'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'shipping'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Shipping & Returns
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Terms of Service */}
        {activeTab === 'terms' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Terms of Service</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Last Updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">1. Acceptance of Terms</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                By accessing and using Charles Discus (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">2. Use License</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Permission is granted to temporarily download one copy of the materials (information or software) on Charles Discus for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>Modifying or copying the materials</li>
                <li>Using the materials for any commercial purpose or for any public display</li>
                <li>Attempting to decompile or reverse engineer any software contained on Charles Discus</li>
                <li>Removing any copyright or other proprietary notations from the materials</li>
                <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">3. Disclaimer</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The materials on Charles Discus are provided on an 'as is' basis. Charles Discus makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">4. Limitations</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                In no event shall Charles Discus or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Charles Discus, even if Charles Discus or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">5. Accuracy of Materials</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The materials appearing on Charles Discus could include technical, typographical, or photographic errors. Charles Discus does not warrant that any of the materials on Charles Discus are accurate, complete, or current. Charles Discus may make changes to the materials contained on its website at any time without notice.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">6. Links</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Charles Discus has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Charles Discus of the site. Use of any such linked website is at the user's own risk.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">7. Modifications</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Charles Discus may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">8. Governing Law</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                These terms and conditions are governed by and construed in accordance with the laws of the over 90+ Countries, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>
          </div>
        )}

        {/* Privacy Policy */}
        {activeTab === 'privacy' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Privacy Policy</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Last Updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">1. Introduction</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Charles Discus ("we", "our", or "us") operates the Charles Discus website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">2. Information Collection and Use</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We collect several different types of information for various purposes to provide and improve our Service to you.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Types of Data Collected:</h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Personal Data: Name, email address, phone number, postal address, cookies and usage data</li>
                  <li>Usage Data: Information about how you interact with our Service</li>
                  <li>Payment Information: Credit card details (processed securely through third-party payment processors)</li>
                  <li>Device Information: Device type, browser type, IP address, operating system</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">3. Use of Data</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Charles Discus uses the collected data for various purposes:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>To provide and maintain our Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To allow you to participate in interactive features of our Service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information so we can improve our Service</li>
                <li>To monitor the usage of our Service</li>
                <li>To detect, prevent and address technical and security issues</li>
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">4. Security of Data</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">5. Third-Party Service Providers</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We may employ third-party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">6. Changes to This Privacy Policy</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">7. Contact Us</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-900 dark:text-white font-semibold">Email: privacy@Charles Discus.com</p>
                <p className="text-gray-600 dark:text-gray-400">Phone: +1 (555) 123-4567</p>
              </div>
            </section>
          </div>
        )}

        {/* Shipping & Returns */}
        {activeTab === 'shipping' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Shipping & Returns Policy</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Last Updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">1. Shipping Information</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We offer fast and reliable shipping to customers throughout the world.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Standard Shipping</p>
                  <p className="text-gray-600 dark:text-gray-400">3-5 business days | FREE for orders over $25,000</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Express Shipping</p>
                  <p className="text-gray-600 dark:text-gray-400">1-2 business days | $8,000</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Overnight Shipping</p>
                  <p className="text-gray-600 dark:text-gray-400">Next business day | $13,000</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">International Shipping</p>
                  <p className="text-gray-600 dark:text-gray-400">7-14 business days | Calculated at checkout</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">2. Order Processing</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Orders are processed within 1-2 business days. Once your order is shipped, you will receive a shipping confirmation email with a tracking number. Please allow up to 24 hours for tracking information to update.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">3. Returns</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We offer a 30-day money-back guarantee on all products. If you are not satisfied with your purchase for any reason, you can return it for a full refund.
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-gray-900 dark:text-white font-semibold mb-2">Return Requirements:</p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Items must be returned within 30 days of delivery</li>
                  <li>Items must be in original condition with all packaging</li>
                  <li>Proof of purchase is required</li>
                  <li>Return shipping is free on defective items</li>
                  <li>Customer pays return shipping for other returns</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">4. Refunds</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Refunds will be processed within 5-7 business days after we receive your return. The refund will be issued to your original payment method. Please note that it may take an additional 5-10 business days for your bank or credit card company to process the refund.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">5. Damaged or Defective Items</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you receive a damaged or defective item, please contact us within 3 days of delivery. We will arrange for a replacement or refund at no additional cost to you.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">6. Tracking Orders</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You can track your order using the tracking number provided in your shipping confirmation email. Visit our website or the carrier's website to get real-time updates on your shipment.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">7. Contact Us for Returns</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                To initiate a return, please contact our customer service team:
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-900 dark:text-white font-semibold">Email: returns@Charles Discus.com</p>
                <p className="text-gray-600 dark:text-gray-400">Phone: +1 (555) 123-4567</p>
                <p className="text-gray-600 dark:text-gray-400">Hours: Mon-Fri, 9am-6pm EST</p>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Acceptance Box */}
      <section className="bg-gray-50 dark:bg-gray-900 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Agreement</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            By using Charles Discus, you agree to comply with our Terms of Service, Privacy Policy, and Shipping & Returns Policy. If you do not agree with any of these policies, please do not use our service.
          </p>
          <a 
            href="/" 
            className="inline-block bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition"
          >
            Back to Home
          </a>
        </div>
      </section>
    </div>
  );
}
