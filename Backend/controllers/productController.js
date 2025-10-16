import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 🟢 Get All Products
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, supplier: true },
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟣 Create Product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity_in_stock, expiry_date, categoryId, supplierId } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        quantity_in_stock: Number(quantity_in_stock),
        expiry_date: new Date(expiry_date),
        categoryId: Number(categoryId),
        supplierId: Number(supplierId),
      },
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// 🟠 Update Product