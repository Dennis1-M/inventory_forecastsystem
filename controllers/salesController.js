import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getSales = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({ include: { product: true }, orderBy: { date: "desc" }});
    res.json(sales);
  } catch (err) {
    console.error("getSales:", err);
    res.status(500).json({ error: err.message });
  }
};

export const createSale = async (req, res) => {
  try {
    const { productId, quantity, totalPrice, date } = req.body;
    if (!productId || !quantity) return res.status(400).json({ error: "productId and quantity required" });

    const product = await prisma.product.findUnique({ where: { id: Number(productId) }});
    if (!product) return res.status(404).json({ error: "Product not found" });

    const sale = await prisma.sale.create({
      data: {
        productId: Number(productId),
        quantity: Number(quantity),
        totalPrice: totalPrice !== undefined ? Number(totalPrice) : 0,
        date: date ? new Date(date) : new Date()
      }
    });

    // optionally decrement product stock (be careful if seeded historical data)
    await prisma.product.update({ where: { id: Number(productId) }, data: { stock: { decrement: Number(quantity) } }});

    res.status(201).json(sale);
  } catch (err) {
    console.error("createSale:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getSaleById = async (req, res) => {
  try {
    const sale = await prisma.sale.findUnique({ where: { id: Number(req.params.id) }, include: { product: true }});
    if (!sale) return res.status(404).json({ error: "Sale not found" });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSale = async (req, res) => {
  try {
    const updated = await prisma.sale.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteSale = async (req, res) => {
  try {
    await prisma.sale.delete({ where: { id: Number(req.params.id) }});
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getSalesForForecast = async (req, res) => {
  try {
    const data = await prisma.sale.findMany({
      select: {
        date: true,
        quantity: true,
        productId: true,
      },
      orderBy: { date: "asc" },
    });
    res.json(data);
  } catch (err) {
    console.error("getSalesForForecast:", err);
    res.status(500).json({ error: err.message });
  }
};
