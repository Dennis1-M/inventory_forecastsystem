// backend/services/alertEngine.js
// --------------------------------------------------
// Central decision engine for inventory alerts
// --------------------------------------------------

import { prisma } from "../prismaClient.js";
import { emitAlert } from "../sockets/index.js";
import {
    evaluateExpiryRisk,
    evaluateOverstockRisk,
    evaluateStockoutRisk
} from "./riskEvaluator.js"; // all risk functions imported from riskEvaluator.js

// --------------------------------------------------
// Main function to run alert engine for a single product
// --------------------------------------------------
export async function runAlertEngineForProduct(productId) {
  // Fetch product from DB
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });
  if (!product) return;

  // Get latest forecast run for product
  const forecastRun = await prisma.forecastRun.findFirst({
    where: { productId },
    orderBy: { createdAt: "desc" },
    include: { points: true }
  });
  if (!forecastRun || forecastRun.points.length === 0) return;

  // Evaluate risks
  const stockoutRisk = evaluateStockoutRisk(product, forecastRun.points);
  const overstockRisk = evaluateOverstockRisk(product, forecastRun.points);
  const expiryEval = evaluateExpiryRisk(product);

  // Create/update expiry alert
  await createOrUpdateAlert(productId, "EXPIRY", expiryEval, []);

  // Resolve low-risk alerts for this product
  await resolveAlerts(productId, ["LOW_STOCK", "OVERSTOCK", "EXPIRY"]);

  // Fetch existing unresolved alerts for this product
  const existingAlerts = await prisma.alert.findMany({
    where: { productId, isResolved: false }
  });

  // ---------------------------------
  // STOCKOUT / LOW STOCK ALERTS
  // ---------------------------------
  if (stockoutRisk.level === "HIGH") {
    await createOrUpdateAlert(
      productId,
      "OUT_OF_STOCK",
      { reason: "High risk of stockout based on forecast", riskScore: 100 },
      existingAlerts
    );
  } else if (stockoutRisk.level === "MEDIUM") {
    await createOrUpdateAlert(
      productId,
      "LOW_STOCK",
      { reason: "Stock likely to fall below reorder point", riskScore: 60 },
      existingAlerts
    );
  } else {
    await resolveAlerts(productId, ["LOW_STOCK", "OUT_OF_STOCK"]);
  }

  // ---------------------------------
  // OVERSTOCK ALERT
  // ---------------------------------
  if (overstockRisk.level === "MEDIUM") {
    await createOrUpdateAlert(
      productId,
      "OVERSTOCK",
      { reason: "Stock exceeds forecasted demand", riskScore: 60 },
      existingAlerts
    );
  } else {
    await resolveAlerts(productId, ["OVERSTOCK"]);
  }
}

// --------------------------------------------------
// Helper: Create or update alert in the DB
// --------------------------------------------------
async function createOrUpdateAlert(productId, type, evaluation, existingAlerts) {
  const exists = existingAlerts.find(a => a.type === type);

  // Save risk evaluation as JSON string in message
  const alertMessage = JSON.stringify({
    message: evaluation.reason,
    riskScore: evaluation.riskScore
  });

  if (!exists) {
    const alert = await prisma.alert.create({
      data: {
        productId,
        type,
        message: alertMessage
      }
    });
    try { emitAlert({ id: alert.id, productId: alert.productId, type: alert.type, message: alert.message, createdAt: alert.createdAt }); } catch (e) { console.warn('Emit alert failed', e.message); }
  } else {
    // Update existing alert
    await prisma.alert.update({
      where: { id: exists.id },
      data: { message: alertMessage }
    });
  }
}

// --------------------------------------------------
// Helper: Resolve low-risk alerts
// --------------------------------------------------
async function resolveAlerts(productId, types) {
  await prisma.alert.updateMany({
    where: {
      productId,
      type: { in: types },
      isResolved: false
    },
    data: { isResolved: true }
  });
}

// ----------------------
// TEST ALERT ENGINE
// ----------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  // Example: test product with ID = 1
  const testProductId = 1;

  runAlertEngineForProduct(testProductId)
    .then(() => {
      console.log(`✅ Alert engine ran for product ID ${testProductId}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Alert engine test failed:", err);
      process.exit(1);
    });
}
