import { Alert } from "../models/Alert.js";
import { Product } from "../models/Product.js";

export const getAlerts = async (req, res) => {
  const alerts = await Alert.findAll({ include: ["product"], order: [["createdAt", "DESC"]] });
  res.json(alerts);
};

export const createAlert = async (req, res) => {
  try {
    const { productId, alert_type, message } = req.body;
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const alert = await Alert.create({ productId, alert_type, message });
    res.status(201).json(alert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const resolveAlert = async (req, res) => {
  const alert = await Alert.findByPk(req.params.id);
  if (!alert) return res.status(404).json({ error: "Alert not found" });

  alert.resolved = true;
  await alert.save();
  res.json(alert);
};
