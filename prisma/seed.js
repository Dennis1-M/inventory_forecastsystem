import { PrismaClient } from "@prisma/client";
import csv from "csv-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function importCSV(filePath) {
  return new Promise((resolve) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => rows.push(data))
      .on("end", () => resolve(rows));
  });
}

async function main() {
  const products = await importCSV(path.join(__dirname, "../data/product_record.csv"));
  const inventory = await importCSV(path.join(__dirname, "../data/inventory_record.csv"));
  const sales = await importCSV(path.join(__dirname, "../data/sale_record.csv"));

  // Insert products
  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  // Insert inventory records
  for (const i of inventory) {
    await prisma.inventoryMovement.create({ data: i });
  }

  // Insert sales records
  for (const s of sales) {
    await prisma.sale.create({ data: s });
  }

  console.log("✓ Data imported");
}

main();
