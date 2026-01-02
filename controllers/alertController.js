// controllers/alertController.js
// --------------------------------------
// Exposes alert data to dashboards
// --------------------------------------

import { prisma } from "../prismaClient.js";

export const getActiveAlerts = async (req, res) => {
  const alerts = await prisma.alert.findMany({
    where: { isResolved: false },
    include: { product: true },
    orderBy: { createdAt: "desc" }
  });

  res.json(alerts);
};

export const resolveAlert = async (req, res) => {
  const { id } = req.params;

  await prisma.alert.update({
    where: { id: Number(id) },
    data: { isResolved: true }
  });

  res.json({ message: "Alert resolved" });
};
// controllers/alertController.js