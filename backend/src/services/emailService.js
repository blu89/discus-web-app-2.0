import resend from '../config/resend.js';

/**
 * Send order confirmation email to both customer and admin
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

    const customerHtmlContent = `
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
          .logo {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo img {
            height: 60px;
            width: auto;
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
          <div class="logo">
            <img src="${process.env.LOGO_URL || 'https://via.placeholder.com/200x60?text=Logo'}" alt="Imperial Discus Logo">
          </div>
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
              We will send you another email once your payment is successful, including tracking information.
              We'll notify you when your order ships. If you have any questions, please don't hesitate to contact us.
            </p>
            
          </div>
          <div class="footer">
            <p>&copy; 2026 ImperialDiscus. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    `;

    const adminHtmlContent = `
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
          .logo {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo img {
            height: 60px;
            width: auto;
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
            color: #10b981;
            border-top: 2px solid #e5e7eb;
            padding-top: 10px;
          }
          .customer-info {
            background-color: #f0fdf4;
            padding: 15px;
            border-left: 4px solid #10b981;
            margin-bottom: 20px;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #999;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="${process.env.LOGO_URL || 'https://via.placeholder.com/200x60?text=Logo'}" alt="Imperial Discus Logo">
          </div>
          <div class="header">
            <h1>New Order Notification</h1>
            <p>A new order has been received</p>
          </div>
          <div class="content">
            <p>Hello Admin,</p>
            <p>A new order has been placed. Please review the details below:</p>
            
            <div class="customer-info">
              <strong>Customer Name:</strong> ${order.customer_name}<br>
              <strong>Customer Email:</strong> ${order.customer_email}
            </div>

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
          </div>
          <div class="footer">
            <p>&copy; 2026 ImperialDiscus. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    `;

    // Send email to customer
    const customerResponse = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: order.customer_email,
      subject: `Order Confirmation - Order #${order.id}`,
      html: customerHtmlContent,
    });

    if (customerResponse.error) {
      console.error('Resend email error for customer:', customerResponse.error);
      return { success: false, error: customerResponse.error.message };
    }

    console.log('Order confirmation email sent to customer:', order.customer_email);

    // Send notification email to admin if admin email is configured
    const adminEmail = process.env.RESEND_ADMIN_EMAIL;
    if (adminEmail) {
      const adminResponse = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: adminEmail,
        subject: `New Order Notification - Order #${order.id}`,
        html: adminHtmlContent,
      });

      if (adminResponse.error) {
        console.error('Resend email error for admin:', adminResponse.error);
      } else {
        console.log('Order notification email sent to admin:', adminEmail);
      }
    } else {
      console.warn('RESEND_ADMIN_EMAIL not configured. Skipping admin notification.');
    }

    return { success: true, messageId: customerResponse.data.id };
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

/**
 * Send payment confirmation email to customer
 * @param {Object} order - Order object with customer_email, customer_name, total_price
 * @param {String} paymentStatus - 'successful' or 'unsuccessful'
 */
export const sendPaymentConfirmationEmail = async (order, paymentStatus) => {
  try {
    // Validate required fields
    if (!order.customer_email || !order.customer_name) {
      console.error('Missing required order fields for payment confirmation email');
      return { success: false, error: 'Invalid order data' };
    }

    const isSuccessful = paymentStatus === 'successful';
    const headerGradient = isSuccessful 
      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    const headerColor = isSuccessful ? '#10b981' : '#ef4444';
    const statusMessage = isSuccessful 
      ? 'Your payment has been successfully processed!' 
      : 'We were unable to process your payment.';
    const statusTitle = isSuccessful 
      ? 'Payment Successful' 
      : 'Payment Failed';
    const headerTitle = isSuccessful 
      ? 'Payment Confirmation' 
      : 'Payment Status Update';

    const customerHtmlContent = `
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
          .logo {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo img {
            height: 60px;
            width: auto;
          }
          .header {
            background: ${headerGradient};
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
          .status-badge {
            display: inline-block;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            background-color: ${isSuccessful ? '#d1fae5' : '#fee2e2'};
            color: ${isSuccessful ? '#065f46' : '#7f1d1d'};
          }
          .info-box {
            background-color: ${isSuccessful ? '#f0fdf4' : '#fef2f2'};
            padding: 20px;
            border-left: 4px solid ${headerColor};
            border-radius: 4px;
            margin: 20px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid ${isSuccessful ? '#d1fae5' : '#fee2e2'};
          }
          .info-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .info-label {
            font-weight: 600;
            color: #666;
          }
          .info-value {
            font-weight: bold;
            color: ${headerColor};
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #999;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          .action-needed {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="${process.env.LOGO_URL || 'https://via.placeholder.com/200x60?text=Logo'}" alt="Imperial Discus Logo">
          </div>
          <div class="header">
            <h1>${headerTitle}</h1>
            <p>${statusMessage}</p>
          </div>
          <div class="content">
            <p>Hi <strong>${order.customer_name}</strong>,</p>
            
            <div class="status-badge">
              ${statusTitle}
            </div>

            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Order ID:</span>
                <span class="info-value">${order.id}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Order Amount:</span>
                <span class="info-value">$${order.total_price.toFixed(2)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Status:</span>
                <span class="info-value">${isSuccessful ? 'Processed' : 'Failed'}</span>
              </div>
            </div>

            ${isSuccessful 
              ? `<p>Your order is now being prepared for shipment. You will receive a tracking number once your items are dispatched.</p>
                 <p>Thank you for your purchase! If you have any questions about your order, please contact our support team.</p>` 
              : `<p class="action-needed">
                   <strong>Action Required:</strong> Your payment could not be processed. Please contact us or try an alternative payment method to complete your order.
                 </p>
                 <p>If you believe this is an error, please reach out to our support team and reference your Order ID: <strong>${order.id}</strong></p>`
            }
          </div>
          <div class="footer">
            <p>&copy; 2026 ImperialDiscus. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    `;

    // Send email to customer
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: order.customer_email,
      subject: `${isSuccessful ? 'Payment Confirmed' : 'Payment Status Update'} - Order #${order.id}`,
      html: customerHtmlContent,
    });

    if (response.error) {
      console.error('Resend payment confirmation email error:', response.error);
      return { success: false, error: response.error.message };
    }

    console.log(`Payment ${paymentStatus} email sent to customer:`, order.customer_email);
    return { success: true, messageId: response.data.id };
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return { success: false, error: error.message };
  }
};
