import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { createAlert } from "../controllers/alertController.js";

const prisma = new PrismaClient();
// URL for the Python Flask/FastAPI server (ML Service)
// Ensure this is set in your .env file (e.g., http://localhost:5002)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5002";

/**
 * * Fetches required historical data and triggers the external ML forecast API.
 * Saves the prediction back to the database.
 * * @param {number} productId 
 * @param {number} horizon 
 * @returns {object} { ok: boolean, run?: ForecastRun, predictedTotal?: number, alertCreated?: Alert }
 */
export async function runForecastForProductInternal(productId, horizon = 14) {
    try {
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return { ok: false, error: "Product not found." };
        }

        // ------------------------------
        // 1. CALL PYTHON ML SERVICE
        // ------------------------------
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/run`, {
            productId: productId,
            horizon: horizon
        });

        const mlData = mlResponse.data;
        
        // ML Service should return: { runId, predictions, mae, accuracy, model }
        if (!mlData || mlData.error) {
             return { ok: false, error: mlData.error || "ML Service returned an error." };
        }

        // ------------------------------
        // 2. PROCESS AND SAVE FORECAST (The Python API now handles the DB save, so we only need to query the new run)
        // ------------------------------
        
        // Wait for a moment to ensure DB transaction in Python is complete (robustness check)
        await new Promise(r => setTimeout(r, 100));
        
        // Fetch the newly created ForecastRun and its points
        const latestRun = await prisma.forecastRun.findFirst({
            where: { id: mlData.runId },
            include: { points: true, product: true },
            orderBy: { createdAt: "desc" }
        });

        if (!latestRun) {
             return { ok: false, error: "Could not retrieve saved forecast run." };
        }

        // ------------------------------
        // 3. GENERATE STOCK ALERT
        // ------------------------------
        let alertCreated = null;
        const currentStock = product.stock;
        
        // Calculate the sum of predicted demand over the forecast horizon
        const predictedDemand = latestRun.points.reduce((sum, point) => sum + point.predicted, 0);

        // Define Reorder Point: If current stock is less than 50% of predicted demand
        const reorderPointRatio = 0.5; // Trigger alert if stock is less than half the predicted demand
        
        if (currentStock < predictedDemand * reorderPointRatio) {
            const message = `LOW STOCK ALERT: ${product.name} (Current Stock: ${currentStock}). Predicted demand for the next ${horizon} days is ${Math.round(predictedDemand)}. Consider reordering.`;
            
            alertCreated = await createAlert(
                productId,
                "STOCK",
                message
            );

            // Note: Since this is an internal function, createAlert is imported directly
            // and we will handle the logic in the regenerated alertController.js later.
        }

        return { 
            ok: true, 
            run: latestRun, 
            predictedTotal: predictedDemand,
            alertCreated: alertCreated 
        };

    } catch (error) {
        console.error("runForecastForProductInternal CRITICAL ERROR:", error.message);
        // Handle axios errors gracefully
        if (axios.isAxiosError(error) && error.response) {
            return { 
                ok: false, 
                error: `ML Service Error: ${error.response.status} - ${error.response.data.error || 'Check ML service logs.'}` 
            };
        }
        return { ok: false, error: error.message };
    }
}