import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import prisma from '../prisma/client.js';

// Helper function to format Excel sheets
const formatExcelWorksheet = (worksheet, headerRow) => {
  // Style header row
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  
  // Auto-fit columns
  worksheet.columns.forEach(column => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, cell => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = maxLength < 10 ? 10 : maxLength + 2;
  });

  // Add borders to all cells
  worksheet.eachRow({ includeEmpty: false }, row => {
    row.eachCell({ includeEmpty: false }, cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });
};

export const exportSales = async (req, res) => {
  try {
    const { format = 'csv' } = req.query; // default to csv for backward compatibility

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
        date: new Date(sale.createdAt).toLocaleDateString(),
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        cashier: sale.user.name,
      }))
    );

    if (format === 'excel' || format === 'xlsx') {
      // Excel export
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales');

      worksheet.columns = [
        { header: 'Sale ID', key: 'saleId', width: 10 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Product Name', key: 'productName', width: 30 },
        { header: 'Quantity', key: 'quantity', width: 12 },
        { header: 'Unit Price', key: 'unitPrice', width: 12 },
        { header: 'Total Price', key: 'totalPrice', width: 12 },
        { header: 'Cashier', key: 'cashier', width: 20 },
      ];

      worksheet.addRows(salesData);
      formatExcelWorksheet(worksheet, worksheet.getRow(1));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=sales-export.xlsx');
      
      await workbook.xlsx.write(res);
      res.end();
    } else {
      // CSV export
      const fields = ['saleId', 'date', 'productName', 'quantity', 'unitPrice', 'totalPrice', 'cashier'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(salesData);

      res.header('Content-Type', 'text/csv');
      res.attachment('sales-export.csv');
      res.send(csv);
    }
  } catch (error) {
    console.error('Error exporting sales data:', error);
    res.status(500).json({ message: 'Error exporting sales data' });
  }
};

export const exportInventory = async (req, res) => {
  try {
    const { format = 'csv' } = req.query;

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
      lastRestocked: item.lastRestocked ? new Date(item.lastRestocked).toLocaleDateString() : 'N/A',
    }));

    if (format === 'excel' || format === 'xlsx') {
      // Excel export
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Inventory');

      worksheet.columns = [
        { header: 'Product ID', key: 'productId', width: 12 },
        { header: 'Product Name', key: 'productName', width: 30 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Quantity', key: 'quantity', width: 12 },
        { header: 'Reorder Level', key: 'reorderLevel', width: 15 },
        { header: 'Last Restocked', key: 'lastRestocked', width: 15 },
      ];

      worksheet.addRows(inventoryData);
      formatExcelWorksheet(worksheet, worksheet.getRow(1));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=inventory-export.xlsx');
      
      await workbook.xlsx.write(res);
      res.end();
    } else {
      // CSV export
      const fields = ['productId', 'productName', 'category', 'quantity', 'reorderLevel', 'lastRestocked'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(inventoryData);

      res.header('Content-Type', 'text/csv');
      res.attachment('inventory-export.csv');
      res.send(csv);
    }
  } catch (error) {
    console.error('Error exporting inventory data:', error);
    res.status(500).json({ message: 'Error exporting inventory data' });
  }
};

export const exportProducts = async (req, res) => {
  try {
    const { format = 'csv' } = req.query;

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
      createdAt: new Date(product.createdAt).toLocaleDateString(),
    }));

    if (format === 'excel' || format === 'xlsx') {
      // Excel export
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Products');

      worksheet.columns = [
        { header: 'Product ID', key: 'productId', width: 12 },
        { header: 'Product Name', key: 'productName', width: 30 },
        { header: 'SKU', key: 'sku', width: 20 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Supplier', key: 'supplier', width: 25 },
        { header: 'Cost Price', key: 'costPrice', width: 12 },
        { header: 'Selling Price', key: 'sellingPrice', width: 12 },
        { header: 'Created At', key: 'createdAt', width: 15 },
      ];

      worksheet.addRows(productsData);
      formatExcelWorksheet(worksheet, worksheet.getRow(1));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=products-export.xlsx');
      
      await workbook.xlsx.write(res);
      res.end();
    } else {
      // CSV export
      const fields = ['productId', 'productName', 'sku', 'category', 'supplier', 'costPrice', 'sellingPrice', 'createdAt'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(productsData);

      res.header('Content-Type', 'text/csv');
      res.attachment('products-export.csv');
      res.send(csv);
    }
  } catch (error) {
    console.error('Error exporting products data:', error);
    res.status(500).json({ message: 'Error exporting products data' });
  }
};
