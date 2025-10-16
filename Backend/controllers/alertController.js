import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 🟢 Get All Alerts
export const getAlerts = async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
};

// 🟣 Create Alert
export const createAlert = async (req, res) => {
  try {
    const { productId, alertType, message } = req.body;

    // Ensure product exists
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    const alert = await prisma.alert.create({
      data: { productId: Number(productId), alertType, message },
    });

    res.status(201).json(alert);
  } catch (error) {
    console.error("Error creating alert:", error);
    res.status(400).json({ message: "Failed to create alert" });
  }
};

// 🟠 Resolve Alert
export const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.update({
      where: { id: Number(id) },
      data: { resolved: true },
    });

    res.json(alert);
  } catch (error) {
    console.error("Error resolving alert:", error);
    res.status(500).json({ message: "Failed to resolve alert" });
  }
};
