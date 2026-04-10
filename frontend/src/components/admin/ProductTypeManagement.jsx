import React, { useState, useEffect } from 'react';
import { productTypeAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function ProductTypeManagement() {
  const [productTypes, setProductTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchProductTypes();
  }, []);

  const fetchProductTypes = async () => {
    try {
      const response = await productTypeAPI.getAll();
      setProductTypes(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (err) {
      console.error('Fetch product types error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch product types');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        await productTypeAPI.update(editingId, formData);
      } else {
        await productTypeAPI.create(formData);
      }
      fetchProductTypes();
      setShowForm(false);
      setFormData({ name: '', description: '' });
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (type) => {
    setFormData({
      name: type.name,
      description: type.description || ''
    });
    setEditingId(type.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await productTypeAPI.delete(id);
      fetchProductTypes();
    } catch (err) {
      setError('Failed to delete product type');
    }
  };

  return (
    <div className="p-8 transition-colors duration-200">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Manage Product Types</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', description: '' });
          }}
          className="bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white px-6 py-2 rounded transition"
        >
          {showForm ? 'Cancel' : 'Add Product Type'}
        </button>
      </div>

      {error && <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded mb-6 transition">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700 mb-8 transition">
          <div className="space-y-4 mb-4">
            <input
              type="text"
              name="name"
              placeholder="Product Type Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
              required
            />
            <textarea
              name="description"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white py-2 rounded-lg transition"
          >
            {editingId ? 'Update Product Type' : 'Create Product Type'}
          </button>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 overflow-x-auto transition">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Name</th>
              <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Description</th>
              <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {productTypes.length > 0 ? (
              productTypes.map((type) => (
                <tr key={type.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-6 py-3 text-gray-900 dark:text-gray-100 font-semibold">{type.name}</td>
                  <td className="px-6 py-3 text-gray-900 dark:text-gray-100">{type.description || '-'}</td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => handleEdit(type)}
                      className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-1 rounded mr-2 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(type.id)}
                      className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-1 rounded transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No product types found. Create one to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
