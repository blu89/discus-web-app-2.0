import React, { useState, useEffect } from 'react';
import { productAPI, categoryAPI, supplierAPI, productTypeAPI, uploadAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [sizesInput, setSizesInput] = useState(''); // Raw string input for sizes
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    product_type_id: '',
    supplier_id: '',
    image_url: '',
    sizes: []
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, suppliersRes, productTypesRes] = await Promise.all([
        productAPI.getAll(),
        categoryAPI.getAll(),
        supplierAPI.getAll(),
        productTypeAPI.getAll()
      ]);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      setSuppliers(Array.isArray(suppliersRes.data) ? suppliersRes.data : []);
      setProductTypes(Array.isArray(productTypesRes.data) ? productTypesRes.data : []);
      setError('');
    } catch (err) {
      console.error('Fetch data error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch data');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getSizesDisplayValue = () => {
    try {
      if (!formData.sizes || !Array.isArray(formData.sizes) || formData.sizes.length === 0) {
        return '';
      }
      return formData.sizes
        .map(s => {
          if (typeof s === 'object' && s.size && s.price !== undefined) {
            return `${s.size}:${s.price}`;
          }
          return '';
        })
        .filter(s => s !== '')
        .join(', ');
    } catch (err) {
      console.error('Error getting sizes display value:', err);
      return '';
    }
  };

  const handleSizeChange = (e) => {
    const inputValue = e.target.value;
    setSizesInput(inputValue); // Store raw input
    
    // Parse and update formData
    if (!inputValue || inputValue.trim() === '') {
      setFormData({
        ...formData,
        sizes: []
      });
      return;
    }
    
    try {
      // Parse "Size:Price,Size:Price" format
      const sizes = inputValue
        .split(',')
        .map(s => {
          const trimmed = s.trim();
          if (!trimmed) return null;
          const parts = trimmed.split(':');
          const size = parts[0]?.trim();
          const priceStr = parts[1]?.trim();
          if (!size || !priceStr) return null;
          const price = parseFloat(priceStr);
          if (isNaN(price)) return null;
          return { size, price };
        })
        .filter(s => s !== null);
      setFormData({
        ...formData,
        sizes: sizes
      });
    } catch (err) {
      console.error('Error parsing sizes:', err);
    }
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
        image_url: response.data.url
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

    try {
      if (editingId) {
        await productAPI.update(editingId, formData);
      } else {
        await productAPI.create(formData);
      }
      fetchData();
      setShowForm(false);
      setFormData({ name: '', description: '', price: '', stock: '', category_id: '', product_type_id: '', supplier_id: '', image_url: '', sizes: [] });
      setEditingId(null);
      setPreviewImage(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (product) => {
    let sizes = [];
    let sizesDisplayStr = '';
    
    if (product.sizes) {
      try {
        const parsed = JSON.parse(product.sizes);
        if (Array.isArray(parsed)) {
          // Convert to proper format if needed
          sizes = parsed.map(s => {
            if (typeof s === 'object' && s.size && s.price !== undefined) {
              return s;
            } else if (typeof s === 'string') {
              return { size: s, price: 0 };
            }
            return null;
          }).filter(s => s !== null);
        }
      } catch (e) {
        // If parsing fails, assume it's already an array
        if (Array.isArray(product.sizes)) {
          sizes = product.sizes.map(s => {
            if (typeof s === 'object' && s.size && s.price !== undefined) {
              return s;
            } else if (typeof s === 'string') {
              return { size: s, price: 0 };
            }
            return null;
          }).filter(s => s !== null);
        }
      }
    }
    
    // Create display string for sizes input
    sizesDisplayStr = sizes.map(s => `${s.size}:${s.price}`).join(', ');
    
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category_id: product.category_id || '',
      product_type_id: product.product_type_id || '',
      supplier_id: product.supplier_id || '',
      image_url: product.image_url || '',
      sizes: sizes
    });
    setSizesInput(sizesDisplayStr); // Set the raw input string
    setPreviewImage(product.image_url);
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await productAPI.delete(id);
      fetchData();
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  // Helper function to get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'N/A';
  };

  // Helper function to get product type name by ID
  const getProductTypeName = (typeId) => {
    const type = productTypes.find(t => t.id === typeId);
    return type ? type.name : 'N/A';
  };

  // Helper function to get supplier name by ID
  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'N/A';
  };

  return (
    <div className="p-8 transition-colors duration-200">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Manage Products</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', description: '', price: '', stock: '', category_id: '', product_type_id: '', supplier_id: '', image_url: '', sizes: [] });
            setSizesInput(''); // Reset sizes input
            setPreviewImage(null);
          }}
          className="bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white px-6 py-2 rounded transition"
        >
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {error && <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded mb-6 transition">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700 mb-8 transition">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
              required
            />
            <input
              type="number"
              name="stock"
              placeholder="Stock"
              value={formData.stock}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
              required
            />
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select
              name="product_type_id"
              value={formData.product_type_id}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
            >
              <option value="">Select Product Type</option>
              {productTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <select
              name="supplier_id"
              value={formData.supplier_id}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
            >
              <option value="">Select Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
          </div>

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4 transition"
          />

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-2 font-semibold">Product Sizes with Prices</label>
            <input
              type="text"
              placeholder="Enter sizes with prices (e.g., Small:100, Medium:150, Large:200)"
              value={sizesInput}
              onChange={handleSizeChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Format: SizeName:Price</p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-2 font-semibold">Product Image</label>
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
              {formData.image_url && !uploading && (
                <p className="mt-2 text-green-600 dark:text-green-400">✓ Image uploaded</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white py-2 rounded-lg transition"
          >
            {editingId ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 overflow-x-auto transition">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Image</th>
              <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Name</th>
              <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Price</th>
              <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Stock</th>
              <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Category</th>
              <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Product Type</th>
              <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Supplier</th>
              <th className="px-6 py-3 text-left font-bold text-gray-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <td className="px-6 py-3">
                  {product.image_url && (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  )}
                </td>
                <td className="px-6 py-3 text-gray-900 dark:text-gray-100">{product.name}</td>
                <td className="px-6 py-3 text-gray-900 dark:text-gray-100">${product.price.toFixed(0)}</td>
                <td className="px-6 py-3 text-gray-900 dark:text-gray-100">{product.stock}</td>
                <td className="px-6 py-3 text-gray-900 dark:text-gray-100">{getCategoryName(product.category_id)}</td>
                <td className="px-6 py-3 text-gray-900 dark:text-gray-100">{getProductTypeName(product.product_type_id)}</td>
                <td className="px-6 py-3 text-gray-900 dark:text-gray-100">{getSupplierName(product.supplier_id)}</td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-1 rounded mr-2 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-1 rounded transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
