import supabase from '../config/supabase.js';
import { setStaticCacheHeaders, setNoCacheHeaders, deleteCacheByPattern } from '../utils/cache.js';

export const getAllHero = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('hero_banners')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    setStaticCacheHeaders(req, res);
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createHero = async (req, res) => {
  try {
    const { url, title, description } = req.body;

    if (!url || !title) {
      return res.status(400).json({ error: 'URL and title are required' });
    }

    const { data, error } = await supabase
      .from('hero_banners')
      .insert([{ url, title, description: description || null }])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Clear cache when new hero banner is created
    deleteCacheByPattern('hero');
    setNoCacheHeaders(req, res);
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateHero = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('hero_banners')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Hero banner not found' });
    }

    // Clear cache when hero banner is updated
    deleteCacheByPattern('hero');
    setNoCacheHeaders(req, res);
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteHero = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    const { error } = await supabase
      .from('hero_banners')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Clear cache when hero banner is deleted
    deleteCacheByPattern('hero');
    setNoCacheHeaders(req, res);
    res.json({ message: 'Hero banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
