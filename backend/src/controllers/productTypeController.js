import supabase from '../config/supabase.js';
import { setStaticCacheHeaders, setNoCacheHeaders, deleteCacheByPattern } from '../utils/cache.js';

export const getAllProductTypes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('product_types')
      .select('*');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    setStaticCacheHeaders(req, res);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProductType = async (req, res) => {
  try {
    const { name, description } = req.body;

    const { data, error } = await supabase
      .from('product_types')
      .insert([{ name, description }])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Clear cache when new product type is created
    deleteCacheByPattern('productType');
    setNoCacheHeaders(req, res);
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProductType = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('product_types')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Clear cache when product type is updated
    deleteCacheByPattern('productType');
    setNoCacheHeaders(req, res);
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProductType = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('product_types')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Clear cache when product type is deleted
    deleteCacheByPattern('productType');
    setNoCacheHeaders(req, res);
    res.json({ message: 'Product type deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
