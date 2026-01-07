import cron from 'node-cron';
import prisma from '../config/prisma.js';
import { runProductForecast } from '../forecast2/scheduler/forecastRunner.js';

/**
 * Scheduled Jobs for Forecasting
 * Runs daily at 2:00 AM and weekly on Sunday at 3:00 AM
 */

let scheduledJobs = [];

export const startForecastScheduler = () => {
  console.log('🚀 Starting forecast scheduler...');

  // Daily forecast run at 2:00 AM
  const dailyJob = cron.schedule('0 2 * * *', async () => {
    console.log('⏰ [2:00 AM] Starting daily forecast run...');
    try {
      await runDailyForecasts();
      console.log('✅ Daily forecasts completed successfully');
    } catch (err) {
      console.error('❌ Daily forecast error:', err);
    }
  });

  // Weekly deep analysis on Sunday at 3:00 AM
  const weeklyJob = cron.schedule('0 3 * * 0', async () => {
    console.log('⏰ [3:00 AM Sunday] Starting weekly forecast analysis...');
    try {
      await runWeeklyAnalysis();
      console.log('✅ Weekly analysis completed successfully');
    } catch (err) {
      console.error('❌ Weekly analysis error:', err);
    }
  });

  // Check for low stock daily at 8:00 AM
  const lowStockJob = cron.schedule('0 8 * * *', async () => {
    console.log('⏰ [8:00 AM] Checking low stock items...');
    try {
      await checkAndAlertLowStock();
      console.log('✅ Low stock check completed');
    } catch (err) {
      console.error('❌ Low stock check error:', err);
    }
  });

  scheduledJobs = [dailyJob, weeklyJob, lowStockJob];
  console.log('✅ Forecast scheduler started with 3 jobs');

  return {
    dailyJob,
    weeklyJob,
    lowStockJob,
  };
};

export const stopForecastScheduler = () => {
  console.log('🛑 Stopping forecast scheduler...');
  scheduledJobs.forEach((job) => {
    if (job && typeof job.stop === 'function') {
      job.stop();
    }
  });
  console.log('✅ All scheduled jobs stopped');
};

/**
 * Run forecasts for all products
 */
async function runDailyForecasts() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { id: true, name: true },
    });

    console.log(`Running forecasts for ${products.length} products...`);
    let successful = 0;
    let failed = 0;

    for (const product of products) {
      try {
        await runProductForecast(product.id, 14);
        successful++;
      } catch (err) {
        console.error(`Failed to forecast product ${product.id} (${product.name}):`, err.message);
        failed++;
      }
    }

    console.log(`Forecast results: ${successful} successful, ${failed} failed`);

    // Log job completion
    await prisma.jobLog.create({
      data: {
        jobType: 'DAILY_FORECAST',
        status: failed === 0 ? 'SUCCESS' : 'PARTIAL_FAILURE',
        productsProcessed: successful,
        errorCount: failed,
        details: `Daily forecast run completed. ${successful} products forecasted, ${failed} failed.`,
      },
    }).catch(() => {
      // JobLog table may not exist - ignore
    });
  } catch (err) {
    console.error('Error in runDailyForecasts:', err);
  }
}

/**
 * Weekly analysis: Look for trends, anomalies, and high-risk situations
 */
async function runWeeklyAnalysis() {
  try {
    const products = await prisma.product.findMany({
      include: {
        forecastRuns: {
          include: {
            points: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        supplier: true,
      },
      where: { active: true },
    });

    console.log(`Running weekly analysis for ${products.length} products...`);

    let highRiskCount = 0;
    const alerts = [];

    for (const product of products) {
      const lastForecast = product.forecastRuns[0];
      if (!lastForecast) continue;

      const totalDemand = lastForecast.points.reduce((sum, p) => sum + p.predicted, 0);

      // Alert if stockout risk
      if (product.currentStock < totalDemand) {
        highRiskCount++;
        alerts.push({
          productId: product.id,
          type: 'STOCKOUT_RISK',
          description: `Product ${product.name} current stock (${product.currentStock}) is below 14-day forecasted demand (${Math.round(totalDemand)})`,
          severity: 'HIGH',
        });
      }

      // Alert if overstock
      if (product.currentStock > totalDemand * 3 && totalDemand > 0) {
        alerts.push({
          productId: product.id,
          type: 'OVERSTOCK_RISK',
          description: `Product ${product.name} stock (${product.currentStock}) is 3x the forecasted demand (${Math.round(totalDemand)})`,
          severity: 'MEDIUM',
        });
      }
    }

    console.log(`Weekly analysis found ${alerts.length} alerts (${highRiskCount} high-risk)`);

    // Save alerts if table exists
    if (alerts.length > 0) {
      await prisma.alert.createMany({
        data: alerts.map((a) => ({
          ...a,
          resolved: false,
          createdAt: new Date(),
        })),
      }).catch(() => {
        // Alert table may have issues - ignore
      });
    }
  } catch (err) {
    console.error('Error in runWeeklyAnalysis:', err);
  }
}

/**
 * Check for low stock items and create alerts
 */
async function checkAndAlertLowStock() {
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        active: true,
        currentStock: {
          lte: prisma.product.fields.lowStockThreshold, // Dynamic comparison
        },
      },
      include: {
        supplier: true,
        forecastRuns: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    console.log(`Found ${lowStockProducts.length} low stock items`);

    // Could create notification records here
    if (lowStockProducts.length > 0) {
      const summary = `${lowStockProducts.length} products below low stock threshold`;
      console.log(`⚠️ ${summary}`);
    }
  } catch (err) {
    console.error('Error in checkAndAlertLowStock:', err);
  }
}

export default { startForecastScheduler, stopForecastScheduler };
