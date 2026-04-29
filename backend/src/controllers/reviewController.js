import supabase from '../config/supabase.js';
import { setStaticCacheHeaders, setNoCacheHeaders, deleteCacheByPattern } from '../utils/cache.js';
import { setStaticCacheHeaders, setNoCacheHeaders, deleteCacheByPattern } from '../utils/cache.js';

export const getAllReviews = async (req, res) => {
  try {
    const { product_id, status, limit = 100, offset = 0 } = req.query;

    let query = supabase
      .from('reviews')
      .select('*, users(id, full_name, email), products(id, name)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (product_id) {
      query = query.eq('product_id', product_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase getAllReviews error:', error);
      return res.status(500).json({ error: `Failed to fetch reviews: ${error.message}` });
    }

    setStaticCacheHeaders(req, res);
    res.json({ data: data || [], total: count || 0 });
  } catch (error) {
    console.error('getAllReviews exception:', error.message);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data, error, count } = await supabase
      .from('reviews')
      .select('*, users(id, full_name)', { count: 'exact' })
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase getReviewsByProduct error:', error);
      return res.status(500).json({ error: `Failed to fetch product reviews: ${error.message}` });
    }

    // Calculate average rating
    const { data: ratingData } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('status', 'approved');

    const averageRating = ratingData && ratingData.length > 0
      ? (ratingData.reduce((sum, r) => sum + r.rating, 0) / ratingData.length).toFixed(1)
      : 0;

    setStaticCacheHeaders(req, res);
    res.json({
      data: data || [],
      averageRating,
      total: count || 0
    });
  } catch (error) {
    console.error('getReviewsByProduct exception:', error.message);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data, error, count } = await supabase
      .from('reviews')
      .select('*, products(id, name, image_url)', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase getUserReviews error:', error);
      return res.status(500).json({ error: `Failed to fetch user reviews: ${error.message}` });
    }

    setStaticCacheHeaders(req, res);
    res.json({ data: data || [], total: count || 0 });
  } catch (error) {
    console.error('getUserReviews exception:', error.message);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

export const createReview = async (req, res) => {
  try {
    const { product_id, user_id, rating, title, comment } = req.body;

    // Validate input
    if (!product_id || !user_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid review data' });
    }

    // Check if user already reviewed this product
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', product_id)
      .eq('user_id', user_id)
      .single();

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          product_id,
          user_id,
          rating,
          title: title || `${rating} star review`,
          comment: comment || '',
          status: 'pending', // Reviews require approval
          helpful_count: 0,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Supabase createReview error:', error);
      return res.status(500).json({ error: `Failed to create review: ${error.message}` });
    }

    // Clear review cache when new review is created
    deleteCacheByPattern('review');
    setNoCacheHeaders(req, res);
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('createReview exception:', error.message);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment, status } = req.body;

    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (title !== undefined) updateData.title = title;
    if (comment !== undefined) updateData.comment = comment;
    if (status !== undefined) updateData.status = status;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', reviewId)
      .select();

    if (error) {
      console.error('Supabase updateReview error:', error);
      return res.status(500).json({ error: `Failed to update review: ${error.message}` });
    }

    // Clear cache when review is updated
    deleteCacheByPattern('review');
    setNoCacheHeaders(req, res);
    res.json(data[0]);
  } catch (error) {
    console.error('updateReview exception:', error.message);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Supabase deleteReview error:', error);
      return res.status(500).json({ error: `Failed to delete review: ${error.message}` });
    }

    // Clear cache when review is deleted
    deleteCacheByPattern('review');
    setNoCacheHeaders(req, res);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('deleteReview exception:', error.message);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

export const getStoreReviews = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const { data, error, count } = await supabase
      .from('reviews')
      .select('*, users(id, full_name), products(id, name)', { count: 'exact' })
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase getStoreReviews error:', error);
      return res.status(500).json({ error: `Failed to fetch store reviews: ${error.message}` });
    }

    // Calculate overall average rating
    const { data: ratingData } = await supabase
      .from('reviews')
      .select('rating')
      .eq('status', 'approved');

    const averageRating = ratingData && ratingData.length > 0
      ? (ratingData.reduce((sum, r) => sum + r.rating, 0) / ratingData.length).toFixed(1)
      : 0;

    res.json({
      data: data || [],
      averageRating,
      total: count || 0
    });
  } catch (error) {
    console.error('getStoreReviews exception:', error.message);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};
