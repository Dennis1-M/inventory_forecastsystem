import { PrismaClient } from '@prisma/client';
import colors from 'colors';
import app from './server.js';

export const prisma = new PrismaClient();

const PORT = process.env.PORT || 5001;

const connectAndStartServer = async () => {
  try {
    await prisma.$connect();
    console.log(colors.cyan.bold('✅ PostgreSQL Database Connected via Prisma'));

    // Import cron jobs AFTER Prisma connects successfully
    try {
      await import('./jobs/alertCron.js');
      await import('./jobs/inventoryCron.js');
      console.log(colors.green.bold('✅ Cron jobs initialized'));
    } catch (cronError) {
      console.error(colors.yellow.bold('⚠️ Warning: Cron jobs failed to initialize'), cronError.message);
    }

    app.listen(PORT, () => {
      console.log(colors.yellow.bold(`🚀 Server running on port ${PORT}`));
    });
  } catch (error) {
    console.error(colors.red.bold(`❌ Startup Error: ${error.message}`));
    await prisma.$disconnect();
    process.exit(1);
  }
};

connectAndStartServer();

