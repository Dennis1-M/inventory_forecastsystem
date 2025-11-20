import { PrismaClient } from '@prisma/client';
import colors from 'colors';
import app from './server.js';

// --- Global Prisma Client Instance ---
// Best practice: instantiate PrismaClient once and reuse it.
// All controller files will import and use this instance.
export const prisma = new PrismaClient();

// Access environment variables (loaded by dotenv in server.js/index.js)
const PORT = process.env.PORT || 5000;

/**
 * @function connectAndStartServer
 * @description Connects to the PostgreSQL database using Prisma and starts the Express server.
 */
const connectAndStartServer = async () => {
    try {
        // 1. Verify Database Connection
        // This attempts to connect using the DATABASE_URL from your .env file
        await prisma.$connect();
        console.log(colors.cyan.underline.bold('PostgreSQL Database Connected via Prisma.'));

        // 2. Start the Express Server
        app.listen(PORT, () => {
            console.log(colors.yellow.bold(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
            console.log(colors.green.bold(`Access API at http://localhost:${PORT}`));
        });

    } catch (error) {
        // This catch block handles failed DB connection or server startup errors
        console.error(colors.red.underline.bold(`\n\nFATAL ERROR during startup: ${error.message}`));
        
        // Log detailed message for connection failure
        if (error.code === 'P1001' || error.message.includes('ECONNREFUSED') || error.message.includes('timeout')) {
            console.error(colors.red.bold('HINT: Check 1) If your PostgreSQL server/Docker container is running, and 2) If DATABASE_URL in your .env is correct.'));
        }

        // 3. Close Prisma connection and exit
        await prisma.$disconnect();
        process.exit(1);
    }
};

connectAndStartServer();