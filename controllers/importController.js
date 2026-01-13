import ExcelJS from 'exceljs';
import fs from 'fs';
import prisma from '../prisma/client.js';

export const importData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const filePath = req.file.path;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.worksheets[0];
    const rows = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      rows.push(row.values);
    });
    // Example: Import products (assume columns: name, sku, category, costPrice, unitPrice)
    for (const row of rows) {
      const [ , name, sku, category, costPrice, unitPrice ] = row;
      if (!name || !sku) continue;
      // Find or create category
      let cat = null;
      if (category) {
        cat = await prisma.category.upsert({
          where: { name: category },
          update: {},
          create: { name: category },
        });
      }
      await prisma.product.upsert({
        where: { sku },
        update: { name, costPrice: Number(costPrice), unitPrice: Number(unitPrice), categoryId: cat ? cat.id : undefined },
        create: { name, sku, costPrice: Number(costPrice), unitPrice: Number(unitPrice), categoryId: cat ? cat.id : undefined },
      });
    }
    fs.unlinkSync(filePath);
    res.json({ message: 'Import successful', imported: rows.length });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Import failed', error: error.message });
  }
};
