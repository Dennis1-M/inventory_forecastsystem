import { PrismaClient } from '@prisma/client';
import colors from 'colors';
import app from './server.js';

export const prisma = new PrismaClient();

const PORT = process.env.PORT || 5000;

const connectAndStartServer = async () => {
    try {
        await prisma.$connect();
        console.log(colors.cyan.bold('PostgreSQL Database Connected via Prisma'));

        app.listen(PORT, () => {
            console.log(colors.yellow.bold(`Server running on port ${PORT}`));
        });

    } catch (error) {
        console.error(colors.red.bold(`Startup Error: ${error.message}`));

        await prisma.$disconnect();
        process.exit(1);
    }
};

connectAndStartServer();
