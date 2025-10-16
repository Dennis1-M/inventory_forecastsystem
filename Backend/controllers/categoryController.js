import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 🟢 Get All Categories
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟣 Create Category
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.create({ data: { name } });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 🟠 Update Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: { name },
    });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔴 Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id: Number(id) } });
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
