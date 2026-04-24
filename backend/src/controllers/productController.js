import supabase from '../config/supabase.js';

export const getAllProducts = async (req, res) => {
  try {
    const { category_id, search } = req.query;

    // Start with basic select - don't reference potentially missing columns
    let query = supabase
      .from('products')
      .select('id, name, description, price, stock, image_url, additional_images, created_at, updated_at, category_id, product_type_id, supplier_id, sizes')
      .limit(1000); // Prevent huge responses

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase getAllProducts error:', error);
      return res.status(500).json({ error: `Failed to fetch products: ${error.message}` });
    }

    res.json(data || []);
  } catch (error) {
    console.error('getAllProducts exception:', error.message);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, stock, image_url, additional_images, created_at, updated_at, category_id, product_type_id, supplier_id, sizes')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase getProductById error:', error);
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('getProductById exception:', error.message);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category_id, product_type_id, supplier_id, image_url, additional_images, sizes } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    // Build insert object - only include fields that exist
    const insertData = {
      name,
      description: description || null,
      price: parseFloat(price),
      stock: stock ? parseInt(stock) : 0,
      image_url: image_url || null,
      additional_images: additional_images ? JSON.stringify(additional_images) : null,
      sizes: sizes ? JSON.stringify(sizes) : null
    };

    // Add optional foreign keys if provided (convert empty strings to null)
    if (category_id && category_id.trim() !== '') insertData.category_id = category_id;
    if (product_type_id && product_type_id.trim() !== '') insertData.product_type_id = product_type_id;
    if (supplier_id && supplier_id.trim() !== '') insertData.supplier_id = supplier_id;

    const { data, error } = await supabase
      .from('products')
      .insert([insertData])
      .select('id, name, description, price, stock, image_url, additional_images, created_at, updated_at, category_id, product_type_id, supplier_id, sizes');

    if (error) {
      console.error('Supabase createProduct error:', error);
      return res.status(400).json({ error: `Failed to create product: ${error.message}` });
    }

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('createProduct exception:', error.message);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
// Sanitize updates - only allow specific fields
    const allowedFields = ['name', 'description', 'price', 'stock', 'category_id', 'product_type_id', 'supplier_id', 'image_url', 'additional_images', 'sizes'];
    const sanitizedUpdates = {};
    const uuidFields = ['category_id', 'product_type_id', 'supplier_id'];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        if (key === 'sizes' || key === 'additional_images') {
          sanitizedUpdates[key] = value ? JSON.stringify(value) : null;
        } else if (uuidFields.includes(key)) {
          // Convert empty strings to null for UUID fields
          sanitizedUpdates[key] = value && value.trim() !== '' ? value : null;
        } else {
          sanitizedUpdates[key] = value;
        }
      }
    }

    const { data, error } = await supabase
      .from('products')
      .update(sanitizedUpdates)
      .eq('id', id)
      .select('id, name, description, price, stock, image_url, additional_images, created_at, updated_at, category_id, product_type_id, supplier_id, sizes');

    if (error) {
      console.error('Supabase updateProduct error:', error);
      return res.status(400).json({ error: `Failed to update product: ${error.message}` });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(data[0]);
  } catch (error) {
    console.error('updateProduct exception:', error.message);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('deleteProduct error:', error);
    res.status(500).json({ error: error.message });
  }
};
