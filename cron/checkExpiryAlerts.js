// backend/cron/checkExpiryAlerts.js
// --------------------------------------------------
// Cron job to check for expiring products daily
// --------------------------------------------------

import cron from "node-cron";
import prisma from "../config/prisma.js";
import { sendExpiryAlert } from "../services/emailService.js";
import { evaluateExpiryRisk } from "../services/riskEvaluator.js";
import { sendWhatsAppExpiryAlert } from "../services/whatsappService.js";
import { emitAlert } from "../sockets/index.js";

/**
 * Check all products for expiry alerts
 */
async function checkAllExpiry() {
  try {
    console.log("🔍 Running expiry check...");
    
    const products = await prisma.product.findMany({
      where: {
        expiryDate: { not: null },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        expiryDate: true,
        currentStock: true,
      },
    });

    // Get admin users to send email and WhatsApp notifications
    const adminUsers = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPERADMIN', 'MANAGER'] },
        isActive: true,
      },
      select: { email: true, phone: true },
    });

    let alertsCreated = 0;
    let alertsResolved = 0;
    let emailsSent = 0;
    let whatsappSent = 0;

    for (const product of products) {
      const expiryEval = evaluateExpiryRisk(product);
      const daysLeft = product.expiryDate 
        ? Math.ceil((new Date(product.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

      // Create alerts for high or medium risk
      if (expiryEval.level === "HIGH") {
        const existingAlert = await prisma.alert.findFirst({
          where: {
            productId: product.id,
            type: "EXPIRED",
            isResolved: false,
          },
        });

        if (!existingAlert) {
          const alert = await prisma.alert.create({
            data: {
              productId: product.id,
              type: "EXPIRED",
              message: `${product.name}: ${expiryEval.reason}`,
            },
          });

          emitAlert({ alert, product });
          alertsCreated++;

          // Send notifications to admins
          for (const admin of adminUsers) {
            // Email notification
            await sendExpiryAlert(admin.email, product, daysLeft);
            emailsSent++;
            // WhatsApp notification if phone number is available
            if (admin.phone) {
              await sendWhatsAppExpiryAlert(admin.phone, product, daysLeft);
              whatsappSent++;
            }
          }
        }
      } else if (expiryEval.level === "MEDIUM") {
        const existingAlert = await prisma.alert.findFirst({
          where: {
            productId: product.id,
            type: "EXPIRING_SOON",
            isResolved: false,
          },
        });

        if (!existingAlert) {
          const alert = await prisma.alert.create({
            data: {
              productId: product.id,
              type: "EXPIRING_SOON",
              message: `${product.name}: ${expiryEval.reason}`,
            },
          });

          emitAlert({ alert, product });
          alertsCreated++;

          // Send notifications to admins
          for (const admin of adminUsers) {
            // Email notification
            await sendExpiryAlert(admin.email, product, daysLeft);
            emailsSent++;
            // WhatsApp notification if phone number is available
            if (admin.phone) {
              await sendWhatsAppExpiryAlert(admin.phone, product, daysLeft);
              whatsappSent++;
            }
          }
        }
      } else {
        // Resolve existing expiry alerts if product is safe
        const resolved = await prisma.alert.updateMany({
          where: {
            productId: product.id,
            type: { in: ["EXPIRED", "EXPIRING_SOON"] },
            isResolved: false,
          },
          data: {
            isResolved: true,
          },
        });

        alertsResolved += resolved.count;
      }
    }

    console.log(
      `✅ Expiry check complete: ${alertsCreated} alerts created, ${alertsResolved} resolved, ${emailsSent} emails sent, ${whatsappSent} WhatsApp messages sent`
    );
  } catch (error) {
    console.error("❌ Error checking expiry:", error);
  }
}

/**
 * Schedule cron job to run daily at 6 AM
 */
export function startExpiryCheckCron() {
  // Run daily at 6:00 AM
  cron.schedule("0 6 * * *", checkAllExpiry);
  console.log("📅 Expiry check cron job scheduled (daily at 6:00 AM)");
}

/**
 * Run expiry check immediately (for testing)
 */
export { checkAllExpiry };

