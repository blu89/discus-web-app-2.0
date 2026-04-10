import supabase from '../config/supabase.js';

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

    res.status(201).json(order[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items:order_items(product_id, quantity, price)')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items:order_items(product_id, quantity, price)')
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items:order_items(product_id, quantity, price)');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
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
      return res.status(400).json({ error: error.message });
    }

    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
