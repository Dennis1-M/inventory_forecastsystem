import prisma from '../prisma/client.js';

export const getHealthStatus = async (req, res) => {
  try {
    // Check database connectivity by running a simple query
    await prisma.$queryRaw`SELECT 1`;
    const dbStatus = 'OK';

    // The API is running if this code is executed
    const apiStatus = 'OK';

    res.json({
      apiStatus,
      dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      apiStatus: 'OK', // API is running, but DB connection failed
      dbStatus: 'Error',
      message: 'Database connection failed.',
      error: error.message,
    });
  }
};
