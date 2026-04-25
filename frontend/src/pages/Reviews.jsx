import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewCard from '../components/ReviewCard';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const limit = 12;

  useEffect(() => {
    fetchReviews();
  }, [page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const offset = (page - 1) * limit;
      const response = await axios.get('/api/reviews/store', {
        params: { limit, offset }
      });

      setReviews(response.data.data || []);
      setAverageRating(response.data.averageRating || 0);
      setHasMore((response.data.total || 0) > page * limit);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const getRatingDistribution = () => {
    if (reviews.length === 0) return {};
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      if (distribution[review.rating] !== undefined) {
        distribution[review.rating]++;
      }
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Customer Reviews
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Read what our customers think about CharlesDiscus
          </p>
        </div>

        {/* Overall Rating */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-5xl font-bold text-gray-900 dark:text-white">
                {averageRating}
              </div>
              <div className="text-yellow-400 text-3xl mb-2">
                {'★'.repeat(Math.round(averageRating)) + '☆'.repeat(5 - Math.round(averageRating))}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Based on {reviews.length} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 ml-8">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3 mb-2">
                  <span className="text-gray-600 dark:text-gray-400 text-sm w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${reviews.length > 0 ? (ratingDistribution[rating] / reviews.length) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm w-8">
                    {ratingDistribution[rating] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Reviews List */}
        {loading && page === 1 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          <>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}

            {/* Pagination */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
              >
                Previous
              </button>

              <span className="text-gray-600 dark:text-gray-400">
                Page {page}
              </span>

              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!hasMore}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </div>
  );
}
