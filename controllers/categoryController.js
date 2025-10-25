// controllers/categoryController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getCategories = async (req, res) => {
  try {
    const cats = await prisma.category.findMany({ include: { products: true }});
    res.json(cats);
  } catch (err) {
    console.error("getCategories:", err);
    res.status(500).json({ error: err.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const cat = await prisma.category.create({ data: { name, description }});
    res.status(201).json(cat);
  } catch (err) {
    console.error("createCategory:", err);
    res.status(400).json({ error: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;
    const updated = await prisma.category.update({ where: { id }, data: { name, description }});
    res.json(updated);
  } catch (err) {
    console.error("updateCategory:", err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.category.delete({ where: { id }});
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("deleteCategory:", err);
    res.status(400).json({ error: err.message });
  }
};
