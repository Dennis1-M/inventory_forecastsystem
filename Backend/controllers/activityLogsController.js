 // activityLogsController.js
 // Controller for managing activity logs using Prisma ORM

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/activity-logs
 * Fetch activity logs for all users
 */
export const getActivityLogs = async (req, res) => {
  try {
    const { filter = 'all', limit = 100, offset = 0 } = req.query;

    // Build filter
    let whereClause = {};
    if (filter && filter !== 'all') {
      whereClause.action = filter.toUpperCase();
    }

    try {
      const logs = await prisma.activityLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit) || 100,
        skip: parseInt(offset) || 0,
      });

      const total = await prisma.activityLog.count({ where: whereClause });

      return res.json({
        success: true,
        data: logs.map((log) => ({
          id: log.id,
          userId: log.userId,
          userEmail: log.user?.email,
          action: log.action,
          description: log.description,
          timestamp: log.timestamp?.toISOString(),
          ipAddress: log.ipAddress,
          status: log.status || 'success',
        })),
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    } catch (prismaError) {
      // If ActivityLog table doesn't exist (migration not run), return empty data
      if (prismaError.code === 'P1017' || prismaError.message.includes('does not exist')) {
        console.warn('ActivityLog table not found. Run: npm run prisma:migrate');
        return res.json({
          success: true,
          data: [],
          total: 0,
          limit: parseInt(limit),
          offset: parseInt(offset),
          warning: 'ActivityLog table not initialized. Please run: npm run prisma:migrate',
        });
      }
      throw prismaError;
    }
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs',
      error: error.message,
    });
  }
};

/**
 * POST /api/activity-logs
 * Create a new activity log entry
 */
export const createActivityLog = async (req, res) => {
  try {
    const { action, description, ipAddress } = req.body;
    const userId = req.user?.id;

    if (!action || !description) {
      return res.status(400).json({
        success: false,
        message: 'action and description are required',
      });
    }

    const log = await prisma.activityLog.create({
      data: {
        userId,
        action: action.toUpperCase(),
        description,
        ipAddress: ipAddress || req.ip,
        timestamp: new Date(),
        status: 'success',
      },
    });

    res.status(201).json({
      success: true,
      data: log,
      message: 'Activity log created',
    });
  } catch (error) {
    console.error('Error creating activity log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create activity log',
      error: error.message,
    });
  }
};
