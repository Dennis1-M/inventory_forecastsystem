// controllers/alertController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const FASTAPI_RUN = process.env.FASTAPI_URL || "http://127.0.0.1:5002";

export const getAlerts = async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({ include: { product: true }, orderBy: { createdAt: "desc" }});
    res.json(alerts);
  } catch (err) {
    console.error("getAlerts:", err);
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
};

export const createAlert = async (req, res) => {
  try {
    const { productId, alertType, message } = req.body;
    const prod = await prisma.product.findUnique({ where: { id: Number(productId) }});
    if (!prod) return res.status(404).json({ message: "Product not found" });
    const a = await prisma.alert.create({ data: { productId: Number(productId), alertType, message }});
    res.status(201).json(a);
  } catch (err) {
    console.error("createAlert:", err);
    res.status(400).json({ message: "Failed to create alert" });
  }
};

export const resolveAlert = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = await prisma.alert.update({ where: { id }, data: { resolved: true }});
    res.json(updated);
  } catch (err) {
    console.error("resolveAlert:", err);
    res.status(500).json({ message: "Failed to resolve alert" });
  }
};

export const pushAlerts = async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({ include: { product: true }});
    const success = [];
    const skipped = [];
    const failed = [];
    for (const a of alerts) {
      const productName = a.product?.name;
      if (!productName) { skipped.push({ product: null, reason: "no product linked" }); continue; }

      try {
        const resp = await fetch(`${FASTAPI_RUN}/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: productName, horizon: req.body?.horizon || 14 })
        });

        if (resp.ok) { success.push({ product: productName }); }
        else if (resp.status === 404) { skipped.push({ product: productName, reason: "Product not found in FastAPI" }); }
        else {
          const text = await resp.text();
          failed.push({ product: productName, status: resp.status, text });
        }
      } catch (err) {
        failed.push({ product: productName, reason: err.message });
      }
    }
    return res.json({ status: "completed", success, skipped, failed });
  } catch (err) {
    console.error("pushAlerts:", err);
    return res.status(500).json({ message: "Server error while pushing alerts" });
  }
};
