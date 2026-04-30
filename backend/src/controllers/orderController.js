import supabase from '../config/supabase.js';
import { setStaticCacheHeaders, setNoCacheHeaders, deleteCacheByPattern } from '../utils/cache.js';
import { getClientIpAddress } from '../utils/ipAddress.js';
import { sendOrderConfirmationEmail, resendOrderConfirmationEmail } from '../services/emailService.js';

export const createOrder = async (req, res) => {
  try {
    const { 
      items, 
      customer_email, 
      customer_name, 
      shipping_address, 
      total_price,
      card_number,
      card_name,
      card_expiry,
      card_cvv,
      billing_address,
      billing_city,
      billing_state,
      billing_zip,
      billing_country
    } = req.body;

    // Capture client IP address
    const ipAddress = getClientIpAddress(req);
    console.log('Order placed from IP:', ipAddress);

    const { data: order, error } = await supabase
      .from('orders')
      .insert([{
        customer_email,
        customer_name,
        shipping_address,
        total_price,
        card_number,
        card_name,
        card_expiry,
        card_cvv,
        billing_address,
        billing_city,
        billing_state,
        billing_zip,
        billing_country,
        ip_address: ipAddress,
        status: 'pending',
        user_id: req.user?.id || null
      }])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Insert order items
    const orderItems = items.map(item => ({
      order_id: order[0].id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      return res.status(400).json({ error: itemsError.message });
    }

    // Update product stock for each item
    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single();

      if (!productError && product) {
        const newStock = Math.max(0, parseInt(product.stock) - item.quantity);
        await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.product_id);
      }
    }

    // Send order confirmation email asynchronously (non-blocking)
    const emailItems = items.map(item => ({
      product_name: item.product_name || 'Product',
      quantity: item.quantity,
      price: item.price
    }));
    
    sendOrderConfirmationEmail(order[0], emailItems).catch(err => {
      console.error('Failed to send order confirmation email:', err);
    });

    res.status(201).json(order[0]);
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('getOrderById error:', error);
      return res.status(404).json({ error: 'Order not found' });
    }

    // Fetch order items separately if order exists
    if (order) {
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);
      order.order_items = items || [];
    }

    setStaticCacheHeaders(req, res);
    res.json(order);
  } catch (error) {
    console.error('getOrderById exception:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('getUserOrders error:', error);
      return res.status(500).json({ error: error.message });
    }

    // Fetch all order items for these orders at once
    if (orders && orders.length > 0) {
      const orderIds = orders.map(o => o.id);
      const { data: allItems } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      // Attach items to their orders
      const itemsByOrderId = {};
      (allItems || []).forEach(item => {
        if (!itemsByOrderId[item.order_id]) {
          itemsByOrderId[item.order_id] = [];
        }
        itemsByOrderId[item.order_id].push(item);
      });

      orders.forEach(order => {
        order.order_items = itemsByOrderId[order.id] || [];
      });
    }

    setStaticCacheHeaders(req, res);
    res.json(orders || []);
  } catch (error) {
    console.error('getUserOrders exception:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    console.log('getAllOrders called by user:', req.user?.id);
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*');

    if (error) {
      console.error('getAllOrders Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`Found ${orders?.length || 0} orders`);

    // Fetch all order items for these orders at once
    if (orders && orders.length > 0) {
      const orderIds = orders.map(o => o.id);
      const { data: allItems } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      // Attach items to their orders
      const itemsByOrderId = {};
      (allItems || []).forEach(item => {
        if (!itemsByOrderId[item.order_id]) {
          itemsByOrderId[item.order_id] = [];
        }
        itemsByOrderId[item.order_id].push(item);
      });

      orders.forEach(order => {
        order.order_items = itemsByOrderId[order.id] || [];
      });
    }

    setStaticCacheHeaders(req, res);
    console.log('getAllOrders returning response');
    res.json(orders || []);
  } catch (error) {
    console.error('getAllOrders exception:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      console.error('updateOrderStatus error:', error);
      return res.status(400).json({ error: error.message });
    }

    // Clear cache when order is updated
    deleteCacheByPattern('order');
    setNoCacheHeaders(req, res);
    res.json(data[0]);
  } catch (error) {
    console.error('updateOrderStatus exception:', error);
    res.status(500).json({ error: error.message });
  }
};

export const resendConfirmationEmail = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Fetch the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError) {
      return res.status(400).json({ error: 'Failed to fetch order items' });
    }

    // Fetch product details for better email display
    const enrichedItems = [];
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('name')
        .eq('id', item.product_id)
        .single();

      enrichedItems.push({
        product_name: product?.name || 'Product',
        quantity: item.quantity,
        price: item.price
      });
    }

    // Send email
    const emailResult = await resendOrderConfirmationEmail(order, enrichedItems);

    if (!emailResult.success) {
      return res.status(500).json({ 
        error: 'Failed to resend confirmation email',
        details: emailResult.error 
      });
    }

    setNoCacheHeaders(req, res);
    res.json({ 
      success: true, 
      message: 'Confirmation email resent successfully',
      messageId: emailResult.messageId 
    });
  } catch (error) {
    console.error('resendConfirmationEmail exception:', error);
    res.status(500).json({ error: error.message });
  }
};
