// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  const dairy = await prisma.category.upsert({ where: { name: "Dairy" }, update: {}, create: { name: "Dairy", description: "Dairy products" }});
  const snacks = await prisma.category.upsert({ where: { name: "Snacks" }, update: {}, create: { name: "Snacks", description: "Packaged snacks" }});
  const supplier = await prisma.supplier.upsert({ where: { name: "Default Supplier" }, update: {}, create: { name: "Default Supplier", email: "supplier@example.com", phone: "0700000000" }});

  await prisma.product.upsert({
    where: { name: "Milk" },
    update: {},
    create: { name: "Milk", description: "Full cream 1L", stock: 200, categoryId: dairy.id, supplierId: supplier.id }
  });

  await prisma.product.upsert({
    where: { name: "Biscuits" },
    update: {},
    create: { name: "Biscuits", description: "Assorted pack", stock: 120, categoryId: snacks.id, supplierId: supplier.id }
  });

  const hashed = await bcrypt.hash("password", 10);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { name: "Admin", email: "admin@example.com", password: hashed, role: "ADMIN" }
  });

  console.log("Seed complete");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
