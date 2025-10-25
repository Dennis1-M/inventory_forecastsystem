// controllers/supplierController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getSuppliers = async (req, res) => {
  try {
    const list = await prisma.supplier.findMany({ include: { products: true }});
    res.json(list);
  } catch (err) {
    console.error("getSuppliers:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const supplier = await prisma.supplier.findUnique({ where: { id }, include: { products: true }});
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.json(supplier);
  } catch (err) {
    console.error("getSupplierById:", err);
    res.status(500).json({ error: err.message });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const sup = await prisma.supplier.create({ data: { name, email, phone, address }});
    res.status(201).json(sup);
  } catch (err) {
    console.error("createSupplier:", err);
    res.status(400).json({ error: err.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, email, phone, address } = req.body;
    const sup = await prisma.supplier.update({ where: { id }, data: { name, email, phone, address }});
    res.json(sup);
  } catch (err) {
    console.error("updateSupplier:", err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.supplier.delete({ where: { id }});
    res.json({ message: "Supplier deleted successfully" });
  } catch (err) {
    console.error("deleteSupplier:", err);
    res.status(400).json({ error: err.message });
  }
};
