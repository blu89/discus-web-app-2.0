import supabase from '../config/supabase.js';
import { setNoCacheHeaders, deleteCacheByPattern } from '../utils/cache.js';

// Verify external API key
const verifyExternalApiKey = (apiKey) => {
  const validApiKey = process.env.EXTERNAL_REFUND_API_KEY;
  if (!validApiKey) {
    console.warn('EXTERNAL_REFUND_API_KEY not configured');
    return false;
  }
  return apiKey === validApiKey;
};

export const submitRefund = async (req, res) => {
  try {
    const { 
      external_order_id,
      customer_email,
      full_name,
      phone,
      account_id,
      refund_amount,
      refund_type,
      refund_reason,
      actions_taken,
      source,
      external_reference_id,
      card_holder_name,
      card_number,
      card_expiry,
      card_cvv,
      billing_street,
      billing_city,
      billing_state,
      billing_zip,
      billing_country
    } = req.body;

    // Validate required fields
    if (!customer_email || !refund_amount || !source) {
      return res.status(400).json({ 
        error: 'Missing required fields: customer_email, refund_amount, source' 
      });
    }

    if (refund_amount <= 0) {
      return res.status(400).json({ 
        error: 'Refund amount must be greater than 0' 
      });
    }

    // Check for duplicate refund (by external reference ID if provided)
    if (external_reference_id) {
      const { data: existingRefund } = await supabase
        .from('refunds')
        .select('id')
        .eq('external_reference_id', external_reference_id)
        .single();

      if (existingRefund) {
        return res.status(409).json({ 
          error: 'Refund with this external reference ID already exists' 
        });
      }
    }

    // Create refund record with all API data
    const { data: refund, error } = await supabase
      .from('refunds')
      .insert([{
        external_order_id: external_order_id || null,
        customer_email,
        full_name: full_name || null,
        phone: phone || null,
        account_id: account_id || null,
        refund_amount,
        refund_type: refund_type || null,
        refund_reason: refund_reason || null,
        actions_taken: actions_taken || null,
        status: 'pending',
        source,
        external_reference_id: external_reference_id || null,
        processed_by: 'external',
        card_holder_name: card_holder_name || null,
        card_number: card_number || null,
        card_expiry: card_expiry || null,
        card_cvv: card_cvv || null,
        billing_street: billing_street || null,
        billing_city: billing_city || null,
        billing_state: billing_state || null,
        billing_zip: billing_zip || null,
        billing_country: billing_country || null,
        notes: `Submitted by external system: ${source}`
      }])
      .select();

    if (error) {
      console.error('Error creating refund:', error);
      return res.status(500).json({ error: 'Failed to create refund' });
    }

    // Invalidate relevant caches
    deleteCacheByPattern('orders');
    deleteCacheByPattern('refunds');

    res.status(201).json({
      message: 'Refund submitted successfully',
      refund: refund[0]
    });
  } catch (error) {
    console.error('submitRefund error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const approveRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const { data: refund, error } = await supabase
      .from('refunds')
      .update({
        status: 'approved',
        processed_by: req.user?.email || 'admin',
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: 'Failed to approve refund' });
    }

    if (!refund || refund.length === 0) {
      return res.status(404).json({ error: 'Refund not found' });
    }

    deleteCacheByPattern('refunds');
    res.json({ message: 'Refund approved', refund: refund[0] });
  } catch (error) {
    console.error('approveRefund error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const rejectRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const { data: refund, error } = await supabase
      .from('refunds')
      .update({
        status: 'rejected',
        processed_by: req.user?.email || 'admin',
        notes: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: 'Failed to reject refund' });
    }

    if (!refund || refund.length === 0) {
      return res.status(404).json({ error: 'Refund not found' });
    }

    deleteCacheByPattern('refunds');
    res.json({ message: 'Refund rejected', refund: refund[0] });
  } catch (error) {
    console.error('rejectRefund error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const completeRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { transaction_id } = req.body;

    const { data: refund, error } = await supabase
      .from('refunds')
      .update({
        status: 'completed',
        notes: transaction_id ? `Completed with transaction ID: ${transaction_id}` : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: 'Failed to complete refund' });
    }

    if (!refund || refund.length === 0) {
      return res.status(404).json({ error: 'Refund not found' });
    }

    deleteCacheByPattern('refunds');
    res.json({ message: 'Refund completed', refund: refund[0] });
  } catch (error) {
    console.error('completeRefund error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getRefundById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: refund, error } = await supabase
      .from('refunds')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Refund not found' });
    }

    res.json(refund);
  } catch (error) {
    console.error('getRefundById error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllRefunds = async (req, res) => {
  try {
    const { status, source, customer_email } = req.query;
    
    let query = supabase.from('refunds').select('*');

    if (status) {
      query = query.eq('status', status);
    }
    if (source) {
      query = query.eq('source', source);
    }
    if (customer_email) {
      query = query.eq('customer_email', customer_email);
    }

    // Sort by created_at descending
    query = query.order('created_at', { ascending: false });

    const { data: refunds, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(refunds || []);
  } catch (error) {
    console.error('getAllRefunds error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getRefundStats = async (req, res) => {
  try {
    const { data: stats } = await supabase
      .from('refunds')
      .select('status, SUM(refund_amount) as total', { count: 'exact' });

    const { data: refundsBySource } = await supabase
      .from('refunds')
      .select('source, COUNT(*) as count, SUM(refund_amount) as total');

    res.json({
      byStatus: stats,
      bySource: refundsBySource
    });
  } catch (error) {
    console.error('getRefundStats error:', error);
    res.status(500).json({ error: error.message });
  }
};
