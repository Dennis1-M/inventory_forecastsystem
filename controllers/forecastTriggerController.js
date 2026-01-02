// controllers/forecastTriggerController.js
// ----------------------------------------------------
// Trigger alert engine after forecast completion
// Called by Python Forecast Service
// ----------------------------------------------------

import { runAlertEngineForProduct } from "../services/alertEngine.js";

export const triggerAlertsAfterForecast = async (req, res) => {
  try {
    const { productId } = req.body;

    // Validate input
    if (!productId) {
      return res.status(400).json({
        message: "productId is required to trigger alerts"
      });
    }

    // Run alert engine for this product
    await runAlertEngineForProduct(Number(productId));

    return res.json({
      message: "Alert engine executed successfully",
      productId
    });

  } catch (error) {
    console.error("❌ Alert trigger failed:", error);
    return res.status(500).json({
      message: "Failed to run alert engine"
    });
  }
};
// controllers/forecastTriggerController.js