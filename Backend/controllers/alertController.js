// backend/controllers/alertController.js
import colors from "colors";
import { prisma } from "../index.js";

/**
 * GET unread alerts (isRead=false)
 * GET /api/alerts/unread
 */
export const getUnreadAlerts = async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { isRead: false },
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { id: true, name: true, currentStock: true } }
      }
    });

    res.status(200).json(alerts);
  } catch (error) {
    console.error(colors.red("Error fetching unread alerts:"), error);
    res.status(500).json({ message: "Failed to fetch unread alerts.", error: error.message });
  }
};

/**
 * MARK alert as read
 * PUT /api/alerts/:id/read
 */
export const markAlertAsRead = async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid alert id." });

  try {
    const updated = await prisma.alert.update({
      where: { id },
      data: { isRead: true },
    });

    res.status(200).json({ message: "Alert marked as read.", alert: updated });
  } catch (error) {
    console.error(colors.red("Error marking alert as read:"), error);
    res.status(500).json({ message: "Failed to mark alert as read.", error: error.message });
  }
};

/**
 * MARK alert as resolved (optional)
 * PUT /api/alerts/:id/resolve
 */
export const resolveAlert = async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid alert id." });

  try {
    const updated = await prisma.alert.update({
      where: { id },
      data: { isResolved: true },
    });

    res.status(200).json({ message: "Alert resolved.", alert: updated });
  } catch (error) {
    console.error(colors.red("Error resolving alert:"), error);
    res.status(500).json({ message: "Failed to resolve alert.", error: error.message });
  }
};
