import supabase from '../config/supabase.js';
import { setStaticCacheHeaders, setNoCacheHeaders, deleteCacheByPattern } from '../utils/cache.js';

export const getAllCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
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

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, description }])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Clear cache when new category is created
    deleteCacheByPattern('categor');
    setNoCacheHeaders(req, res);
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Clear cache when category is updated
    deleteCacheByPattern('categor');
    setNoCacheHeaders(req, res);
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Clear cache when category is deleted
    deleteCacheByPattern('categor');
    setNoCacheHeaders(req, res);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
