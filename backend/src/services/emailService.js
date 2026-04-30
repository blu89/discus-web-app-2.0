import resend from '../config/resend.js';

/**
 * Send order confirmation email
 * @param {Object} order - Order object with customer_email, customer_name, total_price
 * @param {Array} items - Order items with product name and quantity
 */
export const sendOrderConfirmationEmail = async (order, items) => {
  try {
    // Validate required fields
    if (!order.customer_email || !order.customer_name) {
      console.error('Missing required order fields for email');
      return { success: false, error: 'Invalid order data' };
    }

    const itemsHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          ${item.product_name || 'Product'}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          $${item.price ? item.price.toFixed(2) : '0.00'}
        </td>
      </tr>
    `
      )
      .join('');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
          }
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .order-id {
            background-color: #f3f4f6;
            padding: 10px 15px;
            border-radius: 4px;
            margin-bottom: 20px;
            font-size: 12px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .summary {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 4px;
            margin-bottom: 20px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .summary-row.total {
            font-weight: bold;
            font-size: 18px;
            color: #3b82f6;
            border-top: 2px solid #e5e7eb;
            padding-top: 10px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #999;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          .resend-button {
            text-align: center;
            margin-top: 30px;
          }
          .resend-link {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for your purchase!</p>
          </div>
          <div class="content">
            <p>Hi <strong>${order.customer_name}</strong>,</p>
            <p>We're delighted to confirm that your order has been received. Here are the details:</p>
            
            <div class="order-id">
              <strong>Order ID:</strong> ${order.id}
            </div>

            <h3>Order Items</h3>
            <table>
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Quantity</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>$${(order.total_price * 0.9).toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>Shipping:</span>
                <span>$5.00</span>
              </div>
              <div class="summary-row">
                <span>Tax:</span>
                <span>$${(order.total_price * 0.1).toFixed(2)}</span>
              </div>
              <div class="summary-row total">
                <span>Total:</span>
                <span>$${order.total_price.toFixed(2)}</span>
              </div>
            </div>

            <h3>Shipping Address</h3>
            <p>
              ${order.shipping_address}<br>
              ${order.billing_city}, ${order.billing_state} ${order.billing_zip}<br>
              ${order.billing_country}
            </p>

            <p style="margin-top: 30px; color: #666;">
              We'll notify you when your order ships. If you have any questions, please don't hesitate to contact us.
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Discus. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    `;

    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@discus.com',
      to: order.customer_email,
      subject: `Order Confirmation - Order #${order.id}`,
      html: htmlContent,
    });

    if (response.error) {
      console.error('Resend email error:', response.error);
      return { success: false, error: response.error.message };
    }

    console.log('Order confirmation email sent to:', order.customer_email);
    return { success: true, messageId: response.data.id };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send resend order confirmation email
 * Same as sendOrderConfirmationEmail but called when user requests resend
 */
export const resendOrderConfirmationEmail = async (order, items) => {
  return sendOrderConfirmationEmail(order, items);
};
