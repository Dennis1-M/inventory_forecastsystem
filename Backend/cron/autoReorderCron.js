import cron from 'node-cron';
import { checkAndCreateAutoReorders } from '../services/autoReorderService.js';

/**
 * Auto-Reorder Cron Job
 * Runs every hour to check for products that need reordering
 */

// Run every hour
export const startAutoReorderCron = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Auto-reorder cron job triggered');
    const result = await checkAndCreateAutoReorders();
    
    if (result.success && result.ordersCreated > 0) {
      console.log(`✅ Auto-reorder complete: ${result.ordersCreated} orders created`);
    }
  });

  console.log('✅ Auto-reorder cron job scheduled (runs hourly)');
};

// Also run on server startup
export const runAutoReorderOnStartup = async () => {
  console.log('🚀 Running auto-reorder check on startup...');
  const result = await checkAndCreateAutoReorders();
  
  if (result.success) {
    console.log(`✅ Startup auto-reorder check complete: ${result.ordersCreated || 0} orders created`);
  } else {
    console.log('⚠️  Startup auto-reorder check failed:', result.error);
  }
};
