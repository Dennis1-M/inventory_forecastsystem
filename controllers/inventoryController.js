// controllers/inventoryController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getInventories = async (req, res) => {
  try {
    const items = await prisma.inventory.findMany({ include: { product: true, user: true }});
    res.json(items);
  } catch (err) {
    console.error("getInventories:", err);
    res.status(500).json({ error: err.message });
  }
};

export const createInventory = async (req, res) => {
  try {
    const data = { ...req.body };
    data.productId = Number(data.productId);
    data.userId = Number(data.userId || req.user?.userId || req.user?.id);
    data.quantity = Number(data.quantity);
    data.price = Number(data.price);
    const inv = await prisma.inventory.create({ data });
    res.status(201).json(inv);
  } catch (err) {
    console.error("createInventory:", err);
    res.status(400).json({ error: err.message });
  }
};

export const getItemById = async (req, res) => {
  try {
    const item = await prisma.inventory.findUnique({ where: { id: Number(req.params.id) }, include: { product: true, user: true }});
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    console.error("getItemById:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const payload = req.body;
    if (payload.quantity !== undefined) payload.quantity = Number(payload.quantity);
    if (payload.price !== undefined) payload.price = Number(payload.price);
    const updated = await prisma.inventory.update({ where: { id }, data: payload });
    res.json(updated);
  } catch (err) {
    console.error("updateItem:", err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    await prisma.inventory.delete({ where: { id: Number(req.params.id) }});
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("deleteItem:", err);
    res.status(500).json({ error: err.message });
  }
};
