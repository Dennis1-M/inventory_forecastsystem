import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 🟢 Get All Sales
export const getSales = async (req, res) => {
  try {
    const sales = await prisma.saleRecord.findMany({ include: { product: true } });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟣 Create Sale
export const createSale = async (req, res) => {
  try {
    const { productId, quantity_sold } = req.body;

    const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.quantity_in_stock < quantity_sold)
      return res.status(400).json({ error: "Not enough stock available" });

    // Update stock and record sale (transaction)
    const [updatedProduct, sale] = await prisma.$transaction([
      prisma.product.update({
        where: { id: Number(productId) },
        data: { quantity_in_stock: product.quantity_in_stock - quantity_sold },
      }),
      prisma.saleRecord.create({
        data: { productId: Number(productId), quantity_sold: Number(quantity_sold) },
      }),
    ]);

    res.status(201).json({ sale, updatedProduct });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// 🟠 Get Sales by Product ID