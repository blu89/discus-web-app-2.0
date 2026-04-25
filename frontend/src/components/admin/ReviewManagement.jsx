import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [reviews, statusFilter, searchTerm]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/reviews', {
        params: { limit: 1000 }
      });
      setReviews(response.data.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = reviews;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.products?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReviews(filtered);
  };

  const handleApprove = async (reviewId) => {
    try {
      await axios.put(`/api/reviews/${reviewId}`, { status: 'approved' });
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, status: 'approved' } : r));
    } catch (err) {
      console.error('Error approving review:', err);
      alert('Failed to approve review');
    }
  };

  const handleReject = async (reviewId) => {
    try {
      await axios.put(`/api/reviews/${reviewId}`, { status: 'rejected' });
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, status: 'rejected' } : r));
    } catch (err) {
      console.error('Error rejecting review:', err);
      alert('Failed to reject review');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review permanently?')) return;

    try {
      await axios.delete(`/api/reviews/${reviewId}`);
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review');
    }
  };

  const startEdit = (review) => {
    setEditingReview(review.id);
    setEditData({ ...review });
  };

  const saveEdit = async (reviewId) => {
    try {
      await axios.put(`/api/reviews/${reviewId}`, editData);
      setReviews(reviews.map(r => r.id === reviewId ? editData : r));
      setEditingReview(null);
    } catch (err) {
      console.error('Error updating review:', err);
      alert('Failed to update review');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      approved: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      rejected: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Review Management</h3>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search reviews..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">Loading reviews...</p>
      ) : filteredReviews.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">User</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Title</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Rating</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr key={review.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    {review.products?.name || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    {review.users?.full_name || 'Anonymous'}
                  </td>
                  <td className="px-4 py-3">
                    {editingReview === review.id ? (
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        maxLength={100}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <span className="text-gray-700 dark:text-gray-300">{review.title}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-yellow-400">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingReview === review.id ? (
                      <select
                        value={editData.status}
                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(review.status)}`}>
                        {review.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingReview === review.id ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => saveEdit(review.id)}
                          className="text-green-600 hover:text-green-800 font-medium text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingReview(null)}
                          className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => startEdit(review)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          Edit
                        </button>
                        {review.status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(review.id)}
                            className="text-green-600 hover:text-green-800 font-medium text-sm"
                          >
                            Approve
                          </button>
                        )}
                        {review.status !== 'rejected' && (
                          <button
                            onClick={() => handleReject(review.id)}
                            className="text-yellow-600 hover:text-yellow-800 font-medium text-sm"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center py-12 text-gray-600 dark:text-gray-400">
          No reviews found
        </p>
      )}
    </div>
  );
}
