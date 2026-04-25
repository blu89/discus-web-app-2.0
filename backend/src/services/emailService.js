import transporter from '../config/email.js';

/**
 * Send order notification email to admin
 * @param {Object} order - Order details
 * @param {Array} orderItems - Array of order items with product details
 */
export const sendOrderNotification = async (order, orderItems) => {
  try {
    if (!process.env.ADMIN_EMAIL || !process.env.EMAIL_USER) {
      console.warn('Email credentials not configured. Skipping email notification.');
      return true;
    }

    // Format order items for email
    const itemsHtml = orderItems
      .map(
        (item) =>
          `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">${item.product_name || 'Product'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">$${parseFloat(item.price).toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.quantity * parseFloat(item.price)).toFixed(2)}</td>
      </tr>
      `
      )
      .join('');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Order #${order.id} - ${order.customer_name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 5px 5px; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #e5e7eb; padding: 12px; text-align: left; font-weight: bold; }
            .total-row { background-color: #dbeafe; font-weight: bold; }
            .total-row td { padding: 12px; border-top: 2px solid #2563eb; }
            .status { display: inline-block; background-color: #fef3c7; color: #92400e; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">New Order Received!</h1>
              <p style="margin: 5px 0 0 0;">Order #${order.id}</p>
            </div>
            
            <div class="content">
              <!-- Customer Information -->
              <div class="section">
                <div class="section-title">Customer Information</div>
                <p><strong>Name:</strong> ${order.customer_name}</p>
                <p><strong>Email:</strong> ${order.customer_email}</p>
              </div>

              <!-- Order Details -->
              <div class="section">
                <div class="section-title">Order Details</div>
                <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                <p><strong>Status:</strong> <span class="status">${order.status.toUpperCase()}</span></p>
              </div>

              <!-- Order Items -->
              <div class="section">
                <div class="section-title">Items Ordered</div>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style="text-align: center;">Qty</th>
                      <th style="text-align: right;">Price</th>
                      <th style="text-align: right;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                    <tr class="total-row">
                      <td colspan="3" style="text-align: right;">Total:</td>
                      <td style="text-align: right;">$${parseFloat(order.total_price).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Shipping Information -->
              <div class="section">
                <div class="section-title">Shipping Address</div>
                <p>${order.shipping_address}</p>
              </div>

              <!-- Billing Information -->
              <div class="section">
                <div class="section-title">Billing Address</div>
                <p>${order.billing_address}<br>${order.billing_city}, ${order.billing_state} ${order.billing_zip}<br>${order.billing_country}</p>
              </div>

              <!-- Payment Information -->
              <div class="section">
                <div class="section-title">Payment Information</div>
                <p><strong>Card Holder:</strong> ${order.card_name}</p>
                <p><strong>Card Last 4 Digits:</strong> ${order.card_number.slice(-4).padStart(order.card_number.length, '*')}</p>
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
                <p>This is an automated email. Please do not reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order notification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending order notification email:', error);
    // Don't throw error - allow order to be created even if email fails
    return false;
  }
};

/**
 * Send order confirmation email to customer
 * @param {Object} order - Order details
 * @param {Array} orderItems - Array of order items with product details
 */
export const sendOrderConfirmationToCustomer = async (order, orderItems) => {
  try {
    if (!process.env.EMAIL_USER) {
      console.warn('Email credentials not configured. Skipping customer confirmation email.');
      return true;
    }

    // Format order items for email
    const itemsHtml = orderItems
      .map(
        (item) =>
          `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">${item.product_name || 'Product'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">$${parseFloat(item.price).toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.quantity * parseFloat(item.price)).toFixed(2)}</td>
      </tr>
      `
      )
      .join('');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.customer_email,
      subject: `Order Confirmation #${order.id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 5px 5px; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #e5e7eb; padding: 12px; text-align: left; font-weight: bold; }
            .total-row { background-color: #dbeafe; font-weight: bold; }
            .total-row td { padding: 12px; border-top: 2px solid #2563eb; }
            .status { display: inline-block; background-color: #fef3c7; color: #92400e; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Order Confirmation</h1>
              <p style="margin: 5px 0 0 0;">Order #${order.id}</p>
            </div>
            
            <div class="content">
              <p>Hi ${order.customer_name},</p>
              <p>Thank you for your order! We've received your purchase and are processing it now.</p>

              <!-- Order Details -->
              <div class="section">
                <div class="section-title">Order Details</div>
                <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                <p><strong>Status:</strong> <span class="status">${order.status.toUpperCase()}</span></p>
              </div>

              <!-- Order Items -->
              <div class="section">
                <div class="section-title">Items Ordered</div>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style="text-align: center;">Qty</th>
                      <th style="text-align: right;">Price</th>
                      <th style="text-align: right;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                    <tr class="total-row">
                      <td colspan="3" style="text-align: right;">Total:</td>
                      <td style="text-align: right;">$${parseFloat(order.total_price).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Shipping Information -->
              <div class="section">
                <div class="section-title">Shipping Address</div>
                <p>${order.shipping_address}</p>
              </div>

              <div style="margin-top: 30px; padding: 20px; background-color: #e0f2fe; border-radius: 5px; border-left: 4px solid #2563eb;">
                <p><strong>📦 What's Next?</strong><br>
                We're preparing your order for shipment. You'll receive a tracking number via email once your items have been dispatched.</p>
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
                <p>If you have any questions, please don't hesitate to contact us.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to customer:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    // Don't throw error - allow order to be created even if email fails
    return false;
  }
};
