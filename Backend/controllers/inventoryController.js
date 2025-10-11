import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// CREATE Item
export const createItem = async (req, res) => { try 
    {
    const { name, description, quantity, price } = req.body;
    const userId = req.user.id; // from JWT middleware
    const newItem = await prisma.inventory.create({data: { name, description, quantity: Number(quantity), price: Number(price), userId },
    });
    res.status(201).json(newItem);
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
};

// GET All Items
export const getItems = async (req, res) => {try
    {
    const items = await prisma.inventory.findMany({ where: { userId: req.user.id } });
    res.status(200).json(items);
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
};

// GET Single Item
export const getItemById = async (req, res) => {
try {
    const item = await prisma.inventory.findUnique({ where: { id: Number(req.params.id) } });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.status(200).json(item);
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
};

// UPDATE Item
export const updateItem = async (req, res) => {
try {
    const { name, description, quantity, price } = req.body;
    const updated = await prisma.inventory.update({
    where: { id: Number(req.params.id) },
    data: { name, description, quantity: Number(quantity), price: Number(price) },
    });
    res.status(200).json(updated);
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
};

// DELETE Item
export const deleteItem = async (req, res) => {
try {
    await prisma.inventory.delete({ where: { id: Number(req.params.id) } });
    res.status(200).json({ message: 'Item deleted successfully' });
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
};
