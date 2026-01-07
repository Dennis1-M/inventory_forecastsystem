// controllers/alertController.js
// --------------------------------------
// Exposes alert data to dashboards
// -----------------------------------

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

export const getUnreadAlerts = async (req, res) => {
  const unreadAlerts = await prisma.alert.findMany({
    where: { isResolved: false, isRead: false },
    include: { product: true },
    orderBy: { createdAt: "desc" }
  });

  res.json(unreadAlerts);
};

export const markAlertAsRead = async (req, res) => {
  const { id } = req.params;

  await prisma.alert.update({
    where: { id: Number(id) },
    data: { isRead: true }
  });

  res.json({ message: "Alert marked as read" });
};
// controllers/alertController.js