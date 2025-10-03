import { SaleRecord } from "../models/SaleRecord.js";
import { Product } from "../models/Product.js";

export const getSales = async (req, res) => {
  const sales = await SaleRecord.findAll({ include: ["product"] });
  res.json(sales);
};

export const createSale = async (req, res) => {
  try {
    const { productId, quantity_sold } = req.body;
    const product = await Product.findByPk(productId);

    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.quantity_in_stock < quantity_sold)
      return res.status(400).json({ error: "Not enough stock available" });

    // Reduce stock
    product.quantity_in_stock -= quantity_sold;
    await product.save();

    // Create sale record
    const sale = await SaleRecord.create({ productId, quantity_sold });
    res.status(201).json(sale);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
