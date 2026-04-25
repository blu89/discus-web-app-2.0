import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import ReviewCard from '../components/ReviewCard';

export default function MyReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const limit = 10;

  useEffect(() => {
    if (user?.id) {
      fetchUserReviews();
    }
  }, [user, page]);

  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const offset = (page - 1) * limit;
      const response = await axios.get(`/api/reviews/user/${user.id}`, {
        params: { limit, offset }
      });

      setReviews(response.data.data || []);
      setHasMore((response.data.total || 0) > page * limit);
    } catch (err) {
      console.error('Error fetching user reviews:', err);
      setError('Failed to load your reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await axios.delete(`/api/reviews/${reviewId}`);
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-400">Please log in to view your reviews.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">My Reviews</h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {loading && page === 1 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading your reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          <>
            {reviews.map((review) => (
              <div key={review.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {review.products?.name}
                    </div>
                    <ReviewCard review={review} />
                  </div>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="ml-4 text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
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
            <p className="text-gray-600 dark:text-gray-400">You haven't written any reviews yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
