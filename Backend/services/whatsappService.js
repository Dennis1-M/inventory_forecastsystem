// services/whatsappService.js
// --------------------------------------------------
// WhatsApp notification service using Twilio
// --------------------------------------------------

import twilio from 'twilio';

// Twilio configuration from environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM; // e.g., 'whatsapp:+14155238886'

/**
 * Create Twilio client
 */
const createClient = () => {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
    console.warn('⚠️  WhatsApp service not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM in .env');
    return null;
  }

  return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
};

/**
 * Send generic WhatsApp message
 */
export const sendWhatsAppMessage = async (to, message) => {
  const client = createClient();
  
  if (!client) {
    console.log('📱 WhatsApp message skipped (not configured):', { to, message: message.substring(0, 50) });
    return { success: false, message: 'WhatsApp service not configured' };
  }

  // Ensure 'to' number is in WhatsApp format
  const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

  try {
    const result = await client.messages.create({
      from: TWILIO_WHATSAPP_FROM,
      to: toNumber,
      body: message,
    });

    console.log('✅ WhatsApp message sent:', result.sid);
    return { success: true, messageSid: result.sid };
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send low stock alert via WhatsApp
 */
export const sendWhatsAppLowStockAlert = async (phoneNumber, product) => {
  const message = `
🚨 *Low Stock Alert*

*Product:* ${product.name}
*SKU:* ${product.sku}
*Current Stock:* ${product.currentStock}
*Threshold:* ${product.lowStockThreshold}

⚠️ *Action Required:* Please reorder this product soon.
  `.trim();

  return sendWhatsAppMessage(phoneNumber, message);
};

/**
 * Send expiry alert via WhatsApp
 */
export const sendWhatsAppExpiryAlert = async (phoneNumber, product, daysUntilExpiry) => {
  const isExpired = daysUntilExpiry <= 0;
  
  const message = isExpired ? `
⚠️ *Product Expired*

*Product:* ${product.name}
*SKU:* ${product.sku}
*Expiry Date:* ${product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}
*Status:* EXPIRED

🚨 *Action Required:* Remove from inventory immediately.
  `.trim() : `
⏰ *Product Expiring Soon*

*Product:* ${product.name}
*SKU:* ${product.sku}
*Expiry Date:* ${product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}
*Days Until Expiry:* ${daysUntilExpiry}

⚠️ *Action Required:* Plan to clear this stock.
  `.trim();

  return sendWhatsAppMessage(phoneNumber, message);
};

/**
 * Send overstock alert via WhatsApp
 */
export const sendWhatsAppOverstockAlert = async (phoneNumber, product) => {
  const message = `
📦 *Overstock Alert*

*Product:* ${product.name}
*SKU:* ${product.sku}
*Current Stock:* ${product.currentStock}

ℹ️ *Notice:* Current stock levels exceed forecasted demand.
  `.trim();

  return sendWhatsAppMessage(phoneNumber, message);
};

/**
 * Send out of stock alert via WhatsApp
 */
export const sendWhatsAppOutOfStockAlert = async (phoneNumber, product) => {
  const message = `
🚨 *OUT OF STOCK ALERT*

*Product:* ${product.name}
*SKU:* ${product.sku}
*Current Stock:* 0

⚠️ *URGENT:* This product is out of stock! Immediate reordering required.
  `.trim();

  return sendWhatsAppMessage(phoneNumber, message);
};

/**
 * Send daily alert digest via WhatsApp
 */
export const sendWhatsAppDailyDigest = async (phoneNumber, alerts) => {
  if (!alerts || alerts.length === 0) return;

  let message = `📊 *Daily Inventory Alerts*\n\nYou have *${alerts.length}* active alerts:\n\n`;

  alerts.forEach((alert, index) => {
    const emoji = alert.type === 'LOW_STOCK' || alert.type === 'OUT_OF_STOCK' ? '🚨' :
                  alert.type === 'OVERSTOCK' ? '📦' :
                  alert.type === 'EXPIRED' || alert.type === 'EXPIRING_SOON' ? '⏰' : 'ℹ️';
    message += `${index + 1}. ${emoji} *${alert.type}*: ${alert.product?.name || 'Unknown'}\n`;
  });

  message += `\n📱 Please review and take appropriate action.`;

  return sendWhatsAppMessage(phoneNumber, message);
};

/**
 * Send forecast completion notification via WhatsApp
 */
export const sendWhatsAppForecastComplete = async (phoneNumber, productName, accuracy) => {
  const message = `
📊 *Forecast Generated*

*Product:* ${productName}
*Accuracy:* ${accuracy ? `${accuracy.toFixed(2)}%` : 'N/A'}

✅ New demand forecast has been generated and is ready for review.
  `.trim();

  return sendWhatsAppMessage(phoneNumber, message);
};

/**
 * Send purchase order notification via WhatsApp
 */
export const sendWhatsAppPurchaseOrderAlert = async (phoneNumber, poData) => {
  const message = `
📋 *Purchase Order Update*

*PO #${poData.id}*
*Supplier:* ${poData.supplier?.name || 'Unknown'}
*Status:* ${poData.status}
*Items:* ${poData.items?.length || 0}

ℹ️ Please check the system for details.
  `.trim();

  return sendWhatsAppMessage(phoneNumber, message);
};

export default {
  sendWhatsAppMessage,
  sendWhatsAppLowStockAlert,
  sendWhatsAppExpiryAlert,
  sendWhatsAppOverstockAlert,
  sendWhatsAppOutOfStockAlert,
  sendWhatsAppDailyDigest,
  sendWhatsAppForecastComplete,
  sendWhatsAppPurchaseOrderAlert,
};
