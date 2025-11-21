import colors from 'colors';
import fetch from 'node-fetch'; // Used for making HTTP requests to the FastAPI service
import { prisma } from '../index.js';

// Retrieve the FastAPI URL from environment variables
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:5002';

// --- Helper function for error handling ---
const handleForecastingError = (res, error, operation) => {
    console.error(colors.red(`Forecasting Error during ${operation}:`), error);
    if (error.message.includes('ECONNREFUSED')) {
        return res.status(503).json({ 
            message: 'Forecasting service is currently unavailable. Please ensure the FastAPI server is running.', 
            service_url: FASTAPI_URL 
        });
    }
    return res.status(500).json({ message: `Failed to ${operation} due to a server error.`, details: error.message });
};

/**
 * @desc Internal function to fetch and aggregate historical sales data
 * @param {number} productId - The ID of the product to forecast
 * @returns {Array} - Array of sales data aggregated by date
 */
const getHistoricalData = async (productId) => {
    // We aggregate sales by day for the last 180 days (approx. 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

    // This query aggregates the quantity sold for a specific product, grouped by day.
    const salesData = await prisma.sale.groupBy({
        by: ['saleDate'],
        where: {
            productId: productId,
            saleDate: {
                gte: sixMonthsAgo,
            },
        },
        _sum: {
            quantitySold: true,
        },
        orderBy: {
            saleDate: 'asc',
        }
    });

    // Format the data into a simple array of objects for the ML model: [{ date: 'YYYY-MM-DD', quantity: N }]
    const formattedData = salesData.map(item => ({
        date: item.saleDate.toISOString().split('T')[0],
        quantity: item._sum.quantitySold || 0,
    }));

    return formattedData;
};


/**
 * @route POST /api/forecast
 * @desc Fetches historical data, sends it to the AI service, and returns the forecast.
 * @access Protected
 */
export const generateForecast = async (req, res) => {
    const { productId, forecastPeriods = 7 } = req.body; // Default forecast for 7 days (1 week)

    if (!productId || isNaN(parseInt(productId))) {
        return res.status(400).json({ message: 'A valid Product ID is required for forecasting.' });
    }

    const pId = parseInt(productId);
    const periods = parseInt(forecastPeriods);

    try {
        // 1. Fetch the necessary historical data from the Prisma DB
        const historicalData = await getHistoricalData(pId);

        if (historicalData.length < 30) {
            return res.status(400).json({ 
                message: 'Insufficient historical data (less than 30 days of sales) to generate a reliable forecast.',
                dataPoints: historicalData.length
            });
        }
        
        // 2. Prepare the payload for the FastAPI service
        const forecastPayload = {
            product_id: pId,
            periods: periods,
            historical_data: historicalData,
        };

        // 3. Call the external AI/Forecasting Service
        const forecastApiUrl = `${FASTAPI_URL}/forecast`;
        
        console.log(colors.yellow(`[AI] Requesting forecast from: ${forecastApiUrl} for Product ID ${pId}`));

        const response = await fetch(forecastApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(forecastPayload),
        });

        // Handle non-200 responses from the AI service
        if (!response.ok) {
            const errorText = await response.text();
            console.error(colors.red(`[AI] FastAPI Service returned error status ${response.status}: ${errorText}`));
            return res.status(response.status).json({ 
                message: 'Forecasting service failed to generate a prediction.',
                details: errorText,
                service_url: forecastApiUrl
            });
        }

        // 4. Parse and return the forecast data
        const forecastResult = await response.json();
        
        res.status(200).json({
            message: `Successfully generated a ${periods}-day forecast for product ${pId}.`,
            ...forecastResult
        });

    } catch (error) {
        handleForecastingError(res, error, 'generating forecast');
    }
};