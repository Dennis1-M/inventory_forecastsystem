// controllers/productController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, supplier: true, Alert: true, sales: true, ForecastRun: true },
      orderBy: { id: "asc" }
    });
    res.json(products);
  } catch (err) {
    console.error("getProducts:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const p = await prisma.product.findUnique({
      where: { id },
      include: { category: true, supplier: true, Alert: true, sales: true }
    });
    if (!p) return res.status(404).json({ message: "Product not found" });
    res.json(p);
  } catch (err) {
    console.error("getProduct:", err);
    res.status(500).json({ error: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const body = { ...req.body };
    // accept different field names and map to 'stock' used in Prisma schema
    if (body.quantity_in_stock !== undefined && body.stock === undefined) body.stock = Number(body.quantity_in_stock);
    if (body.stock !== undefined) body.stock = Number(body.stock);
    if (body.categoryId) body.categoryId = Number(body.categoryId);
    if (body.supplierId) body.supplierId = Number(body.supplierId);

    const product = await prisma.product.create({ data: body });
    res.status(201).json(product);
  } catch (err) {
    console.error("createProduct:", err);
    res.status(400).json({ error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const payload = { ...req.body };
    if (payload.quantity_in_stock !== undefined && payload.stock === undefined) payload.stock = Number(payload.quantity_in_stock);
    if (payload.stock !== undefined) payload.stock = Number(payload.stock);
    const updated = await prisma.product.update({ where: { id }, data: payload });
    res.json(updated);
  } catch (err) {
    console.error("updateProduct:", err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.product.delete({ where: { id }});
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteProduct:", err);
    res.status(400).json({ error: err.message });
  }
};
