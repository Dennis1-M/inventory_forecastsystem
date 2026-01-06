import { Parser } from 'json2csv';
import prisma from '../prisma/client.js';

export const exportSales = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        saleItems: {
          include: {
            product: true,
          },
        },
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const salesData = sales.flatMap((sale) =>
      sale.saleItems.map((item) => ({
        saleId: sale.id,
        date: sale.createdAt,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        cashier: sale.user.name,
      }))
    );

    const fields = ['saleId', 'date', 'productName', 'quantity', 'unitPrice', 'totalPrice', 'cashier'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(salesData);

    res.header('Content-Type', 'text/csv');
    res.attachment('sales-export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting sales data:', error);
    res.status(500).json({ message: 'Error exporting sales data' });
  }
};

export const exportInventory = async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        product: {
          name: 'asc',
        },
      },
    });

    const inventoryData = inventory.map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      category: item.product.category.name,
      quantity: item.quantity,
      reorderLevel: item.reorderLevel,
      lastRestocked: item.lastRestocked,
    }));

    const fields = ['productId', 'productName', 'category', 'quantity', 'reorderLevel', 'lastRestocked'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(inventoryData);

    res.header('Content-Type', 'text/csv');
    res.attachment('inventory-export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting inventory data:', error);
    res.status(500).json({ message: 'Error exporting inventory data' });
  }
};

export const exportProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        supplier: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const productsData = products.map((product) => ({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      category: product.category.name,
      supplier: product.supplier.name,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      createdAt: product.createdAt,
    }));

    const fields = ['productId', 'productName', 'sku', 'category', 'supplier', 'costPrice', 'sellingPrice', 'createdAt'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(productsData);

    res.header('Content-Type', 'text/csv');
    res.attachment('products-export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting products data:', error);
    res.status(500).json({ message: 'Error exporting products data' });
  }
};
