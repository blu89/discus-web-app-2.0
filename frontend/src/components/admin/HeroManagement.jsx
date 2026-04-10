import React, { useState, useEffect } from 'react';
import { heroAPI, uploadAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function HeroManagement() {
  const [heroImages, setHeroImages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchHeroImages();
  }, []);

  const fetchHeroImages = async () => {
    try {
      const response = await heroAPI.getAll();
      setHeroImages(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (err) {
      console.error('Fetch hero images error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch hero images');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const response = await uploadAPI.uploadImage(file);
      setFormData({
        ...formData,
        url: response.data.url
      });
      setError('');
    } catch (err) {
      setError(`Image upload failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.url || !formData.title) {
      setError('Image URL and title are required');
      return;
    }

    try {
      if (editingId) {
        await heroAPI.update(editingId, formData);
      } else {
        await heroAPI.create(formData);
      }
      fetchHeroImages();
      setShowForm(false);
      setFormData({ url: '', title: '', description: '' });
      setEditingId(null);
      setPreviewImage(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (hero) => {
    setFormData({
      url: hero.url,
      title: hero.title,
      description: hero.description || ''
    });
    setPreviewImage(hero.url);
    setEditingId(hero.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hero image?')) return;
    try {
      await heroAPI.delete(id);
      fetchHeroImages();
    } catch (err) {
      setError('Failed to delete hero image');
    }
  };

  return (
    <div className="p-8 transition-colors duration-200">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Manage Hero Banners</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ url: '', title: '', description: '' });
            setPreviewImage(null);
          }}
          className="bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white px-6 py-2 rounded transition"
        >
          {showForm ? 'Cancel' : 'Add Banner'}
        </button>
      </div>

      {error && <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded mb-6 transition">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700 mb-8 transition">
          <div className="space-y-4 mb-4">
            <input
              type="text"
              name="title"
              placeholder="Banner Title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
              required
            />
            <textarea
              name="description"
              placeholder="Banner Description (optional)"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-2 font-semibold">Banner Image</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              {previewImage && (
                <div className="mb-4">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="max-h-48 mx-auto rounded-lg object-cover"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="w-full"
              />
              {uploading && <p className="mt-2 text-blue-500 dark:text-blue-400">Uploading...</p>}
              {formData.url && !uploading && (
                <p className="mt-2 text-green-600 dark:text-green-400">✓ Image uploaded</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white py-2 rounded-lg transition"
          >
            {editingId ? 'Update Banner' : 'Create Banner'}
          </button>
        </form>
      )}

      {/* Current Hero Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {heroImages.length > 0 ? (
          heroImages.map((hero, index) => (
            <div key={hero.id} className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 overflow-hidden transition hover:shadow-xl dark:hover:shadow-gray-600">
              <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                <img 
                  src={hero.url} 
                  alt={hero.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Slide {index + 1}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{hero.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{hero.description || 'No description'}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(hero)}
                    className="flex-1 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(hero.id)}
                    className="flex-1 bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No hero banners found. Create one to get started!</p>
          </div>
        )}
      </div>

      <div className="mt-8 bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
        <p className="text-blue-800 dark:text-blue-200 text-sm">
          <strong>Note:</strong> Hero banners will automatically rotate on the homepage every 5 seconds. You can manage up to 4 banners for the carousel.
        </p>
      </div>
    </div>
  );
}
