import React from 'react';

export default function ReviewCard({ review }) {
  const getStarRating = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white text-lg">{review.title}</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            by {review.users?.full_name || 'Anonymous'} on {formatDate(review.created_at)}
          </p>
        </div>
        <div className="text-yellow-400 text-2xl">
          {getStarRating(review.rating)}
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-4">{review.comment}</p>

      {review.helpful_count > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {review.helpful_count} people found this helpful
        </p>
      )}
    </div>
  );
}
