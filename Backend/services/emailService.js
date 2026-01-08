// services/emailService.js
// --------------------------------------------------
// Email notification service using nodemailer
// --------------------------------------------------

import nodemailer from 'nodemailer';

// Email configuration from environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;

/**
 * Create nodemailer transporter
 */
const createTransporter = () => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn('⚠️  Email service not configured. Set EMAIL_USER and EMAIL_PASS in .env');
    return null;
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_SECURE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
};

/**
 * Send generic email
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('📧 Email skipped (not configured):', { to, subject });
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Inventory System" <${EMAIL_FROM}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send low stock alert email
 */
export const sendLowStockAlert = async (userEmail, product) => {
  const subject = `🚨 Low Stock Alert: ${product.name}`;
  const text = `
Low Stock Alert

Product: ${product.name}
SKU: ${product.sku}
Current Stock: ${product.currentStock}
Threshold: ${product.lowStockThreshold}

Action Required: Please reorder this product soon.
  `;
  const html = `
    <h2>🚨 Low Stock Alert</h2>
    <p><strong>Product:</strong> ${product.name}</p>
    <p><strong>SKU:</strong> ${product.sku}</p>
    <p><strong>Current Stock:</strong> ${product.currentStock}</p>
    <p><strong>Threshold:</strong> ${product.lowStockThreshold}</p>
    <p style="color: red;"><strong>Action Required:</strong> Please reorder this product soon.</p>
  `;

  return sendEmail({ to: userEmail, subject, text, html });
};

/**
 * Send expiry alert email
 */
export const sendExpiryAlert = async (userEmail, product, daysUntilExpiry) => {
  const isExpired = daysUntilExpiry <= 0;
  const subject = isExpired
    ? `⚠️ Product Expired: ${product.name}`
    : `⏰ Product Expiring Soon: ${product.name}`;
  
  const text = `
${isExpired ? 'Product Expired' : 'Product Expiring Soon'}

Product: ${product.name}
SKU: ${product.sku}
Expiry Date: ${product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}
${isExpired ? 'Status: EXPIRED' : `Days Until Expiry: ${daysUntilExpiry}`}

${isExpired ? 'Action Required: Remove from inventory immediately.' : 'Action Required: Plan to clear this stock.'}
  `;
  
  const html = `
    <h2>${isExpired ? '⚠️ Product Expired' : '⏰ Product Expiring Soon'}</h2>
    <p><strong>Product:</strong> ${product.name}</p>
    <p><strong>SKU:</strong> ${product.sku}</p>
    <p><strong>Expiry Date:</strong> ${product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}</p>
    <p><strong>${isExpired ? 'Status:' : 'Days Until Expiry:'}</strong> 
      <span style="color: ${isExpired ? 'red' : 'orange'};">
        ${isExpired ? 'EXPIRED' : daysUntilExpiry}
      </span>
    </p>
    <p style="color: ${isExpired ? 'red' : 'orange'};"><strong>Action Required:</strong> 
      ${isExpired ? 'Remove from inventory immediately.' : 'Plan to clear this stock.'}
    </p>
  `;

  return sendEmail({ to: userEmail, subject, text, html });
};

/**
 * Send overstock alert email
 */
export const sendOverstockAlert = async (userEmail, product) => {
  const subject = `📦 Overstock Alert: ${product.name}`;
  const text = `
Overstock Alert

Product: ${product.name}
SKU: ${product.sku}
Current Stock: ${product.currentStock}

Notice: Current stock levels exceed forecasted demand.
  `;
  const html = `
    <h2>📦 Overstock Alert</h2>
    <p><strong>Product:</strong> ${product.name}</p>
    <p><strong>SKU:</strong> ${product.sku}</p>
    <p><strong>Current Stock:</strong> ${product.currentStock}</p>
    <p style="color: blue;"><strong>Notice:</strong> Current stock levels exceed forecasted demand.</p>
  `;

  return sendEmail({ to: userEmail, subject, text, html });
};

/**
 * Send daily alert digest email
 */
export const sendDailyAlertDigest = async (userEmail, alerts) => {
  if (!alerts || alerts.length === 0) return;

  const subject = `📊 Daily Inventory Alerts Digest (${alerts.length} alerts)`;
  
  const alertsList = alerts.map(alert => `
    - ${alert.type}: ${alert.product?.name || 'Unknown'} (${alert.message})
  `).join('\n');

  const text = `
Daily Inventory Alerts Digest

You have ${alerts.length} active alerts:

${alertsList}

Please review and take appropriate action.
  `;

  const alertsHtml = alerts.map(alert => `
    <li>
      <strong>${alert.type}:</strong> ${alert.product?.name || 'Unknown'}
      <br/><em>${alert.message}</em>
    </li>
  `).join('');

  const html = `
    <h2>📊 Daily Inventory Alerts Digest</h2>
    <p>You have <strong>${alerts.length}</strong> active alerts:</p>
    <ul>
      ${alertsHtml}
    </ul>
    <p>Please review and take appropriate action.</p>
  `;

  return sendEmail({ to: userEmail, subject, text, html });
};

export default {
  sendEmail,
  sendLowStockAlert,
  sendExpiryAlert,
  sendOverstockAlert,
  sendDailyAlertDigest,
};
