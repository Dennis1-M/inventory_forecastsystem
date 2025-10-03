import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { Supplier } from "../models/Supplier.js";

export const getProducts = async (req, res) => {
  const products = await Product.findAll({ include: ["category", "supplier"] });
  res.json(products);
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity_in_stock, expiry_date, categoryId, supplierId } = req.body;
    const product = await Product.create({ name, description, price, quantity_in_stock, expiry_date, categoryId, supplierId });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
