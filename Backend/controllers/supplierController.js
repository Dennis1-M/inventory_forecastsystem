import { Supplier } from "../models/Supplier.js";

export const getSuppliers = async (req, res) => {
  const suppliers = await Supplier.findAll();
  res.json(suppliers);
};

export const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ error: "Supplier not found" });

    await supplier.update(req.body);
    res.json(supplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteSupplier = async (req, res) => {
  const supplier = await Supplier.findByPk(req.params.id);
  if (!supplier) return res.status(404).json({ error: "Supplier not found" });

  await supplier.destroy();
  res.json({ message: "Supplier deleted" });
};
