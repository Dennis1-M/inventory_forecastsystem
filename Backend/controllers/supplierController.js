import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 🟢 Create Supplier
export const createSupplier = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const supplier = await prisma.supplier.create({
      data: { name, email, phone, address },
    });

    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔵 Get All Suppliers
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟣 Get Supplier by ID
export const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await prisma.supplier.findUnique({
      where: { id: Number(id) },
    });

    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟠 Update Supplier
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    const supplier = await prisma.supplier.update({
      where: { id: Number(id) },
      data: { name, email, phone, address },
    });

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔴 Delete Supplier
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.supplier.delete({ where: { id: Number(id) } });
    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 🟠 Get Products by Supplier ID