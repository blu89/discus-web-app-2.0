import supabase from '../config/supabase.js';
import { setStaticCacheHeaders, setNoCacheHeaders, deleteCacheByPattern } from '../utils/cache.js';

export const getAllSuppliers = async (req, res) => {
  try {
    const { search, status } = req.query;

    let query = supabase
      .from('suppliers')
      .select('*')
      .order('name', { ascending: true });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    setStaticCacheHeaders(req, res);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    setStaticCacheHeaders(req, res);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const { name, description, contact_person, email, phone, address, city, country, status } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Supplier name is required' });
    }

    const { data, error } = await supabase
      .from('suppliers')
      .insert([{
        name,
        description,
        contact_person,
        email,
        phone,
        address,
        city,
        country,
        status: status || 'active'
      }])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Clear cache when new supplier is created
    deleteCacheByPattern('supplier');
    setNoCacheHeaders(req, res);
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    // Clear cache when supplier is updated
    deleteCacheByPattern('supplier');
    setNoCacheHeaders(req, res);
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Clear cache when supplier is deleted
    deleteCacheByPattern('supplier');
    setNoCacheHeaders(req, res);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
