import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Helper function to generate random data
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSKU() {
  return `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function seedBigData() {
  console.log("🌱 Starting big data seed...");

  try {
    // Check if users exist, create admin if none
    let userCount = await prisma.user.count();
    let allUsers;
    
    if (userCount === 0) {
      console.log("⚠️  No users found. Creating default admin user...");
      const adminUser = await prisma.user.create({
        data: {
          name: "Admin",
          email: "admin@example.com",
          password: "hashed_admin123", // Should be hashed in real app
          role: "SUPERADMIN"
        }
      });
      console.log(`✓ Created admin user: ${adminUser.email}`);
      allUsers = [adminUser];
    } else {
      allUsers = await prisma.user.findMany();
    }
    
    console.log(`✓ Using ${allUsers.length} users for seeding`);

    // ============ SEED CATEGORIES ============
    console.log("📦 Seeding categories...");
    const categoryNames = [
      "Electronics",
      "Clothing",
      "Food & Beverages",
      "Home & Garden",
      "Sports & Outdoors",
      "Books & Media",
      "Toys & Games",
      "Beauty & Personal Care",
      "Office Supplies",
      "Hardware",
      "Tools",
      "Furniture",
      "Pet Supplies",
      "Automotive",
      "Health & Wellness",
      "Kitchen & Dining",
      "Shoes & Accessories",
      "Jewelry & Watches",
      "Art & Crafts",
      "Industrial",
    ];

    const categories = await Promise.all(
      categoryNames.map((name) =>
        prisma.category.upsert({
          where: { name },
          update: {},
          create: { name },
        })
      )
    );
    console.log(`✓ Created/verified ${categories.length} categories`);

    // ============ SEED SUPPLIERS ============
    console.log("🏢 Seeding suppliers...");
    const supplierNames = [
      "Global Supplies Inc",
      "Premium Distributors",
      "Tech Hub Wholesale",
      "Fashion Forward Ltd",
      "Fresh Foods Co",
      "Home Depot Supplier",
      "Quality Goods Partners",
      "Direct Factory Export",
      "Bulk Buy Wholesale",
      "Elite Imports",
      "Mega Distributors",
      "Standard Suppliers Co",
      "Quick Supply Chain",
      "Best Value Traders",
      "Certified Wholesalers",
    ];

    const suppliers = [];
    for (let i = 0; i < supplierNames.length; i++) {
      const supplier = await prisma.supplier.upsert({
        where: { name: supplierNames[i] },
        update: {},
        create: { name: supplierNames[i] },
      });
      suppliers.push(supplier);
    }
    console.log(`✓ Created/verified ${suppliers.length} suppliers`);

    // ============ SEED PRODUCTS (1000+) ============
    console.log("🛍️  Seeding products (this may take a moment)...");
    const productBaseNames = [
      "Professional Grade Widget",
      "Standard Issue Component",
      "Premium Quality Item",
      "Industrial Supply Unit",
      "Consumer Product Line",
      "Essential Item",
      "Deluxe Edition Model",
      "Budget Friendly Option",
      "Enterprise Solution",
      "Specialty Equipment",
    ];

    const products = [];
    const batchSize = 100;
    let createdCount = 0;

    for (let i = 0; i < 1000; i++) {
      const baseProductName = randomChoice(productBaseNames);
      const productName = `${baseProductName} #${i + 1}`;
      const category = randomChoice(categories);
      const supplier = randomChoice(suppliers);

      try {
        const product = await prisma.product.upsert({
          where: { sku: generateSKU() },
          update: {},
          create: {
            sku: generateSKU(),
            name: productName,
            description: `High-quality ${category.name.toLowerCase()} product. Item #${i + 1}`,
            unitPrice: parseFloat((randomBetween(10, 5000) + Math.random()).toFixed(2)),
            costPrice: parseFloat((randomBetween(5, 2500) + Math.random()).toFixed(2)),
            currentStock: randomBetween(0, 500),
            lowStockThreshold: randomBetween(5, 50),
            categoryId: category.id,
            supplierId: supplier.id,
          },
        });
        products.push(product);
        createdCount++;

        if ((i + 1) % batchSize === 0) {
          console.log(`  → ${i + 1} products processed`);
        }
      } catch (e) {
        // Skip duplicates and continue
        continue;
      }
    }
    console.log(`✓ Created ${createdCount} products`);

    // ============ SEED INVENTORY MOVEMENTS (5000+) ============
    console.log("📊 Seeding inventory movements (5000+)...");
    const movementTypes = ["RECEIPT", "SALE", "ADJUSTMENT_IN", "ADJUSTMENT_OUT"];
    let movementCount = 0;

    for (let i = 0; i < 5000; i++) {
      const product = randomChoice(products);
      const user = randomChoice(allUsers);
      const supplier = product.supplierId ? randomChoice(suppliers) : null;
      const movementType = randomChoice(movementTypes);

      try {
        await prisma.inventoryMovement.create({
          data: {
            type: movementType,
            quantity: randomBetween(1, 100),
            costPrice: product.costPrice || randomBetween(5, 500),
            description: `${movementType} for ${product.name}`,
            productId: product.id,
            userId: user.id,
            supplierId: supplier?.id || null,
          },
        });
        movementCount++;

        if ((i + 1) % 500 === 0) {
          console.log(`  → ${i + 1} inventory movements created`);
        }
      } catch (e) {
        // Continue on error
        continue;
      }
    }
    console.log(`✓ Created ${movementCount} inventory movements`);

    // ============ SEED SALES (3000+) ============
    console.log("💰 Seeding sales with items (3000+)...");
    const paymentMethods = ["CASH", "MPESA", "CARD"];
    let saleCount = 0;

    for (let i = 0; i < 3000; i++) {
      const user = randomChoice(allUsers);
      const paymentMethod = randomChoice(paymentMethods);
      const numItems = randomBetween(1, 5);
      let totalAmount = 0;

      const saleItems = [];
      for (let j = 0; j < numItems; j++) {
        const product = randomChoice(products);
        const quantity = randomBetween(1, 20);
        const unitPrice = product.unitPrice;
        const total = quantity * unitPrice;
        totalAmount += total;

        saleItems.push({
          quantity,
          unitPrice,
          total,
          productId: product.id,
        });
      }

      try {
        await prisma.sale.create({
          data: {
            totalAmount: parseFloat(totalAmount.toFixed(2)),
            paymentMethod,
            userId: user.id,
            items: {
              create: saleItems,
            },
          },
        });
        saleCount++;

        if ((i + 1) % 300 === 0) {
          console.log(`  → ${i + 1} sales created`);
        }
      } catch (e) {
        // Continue on error
        continue;
      }
    }
    console.log(`✓ Created ${saleCount} sales records`);

    // ============ SEED PURCHASE ORDERS (500+) ============
    console.log("📋 Seeding purchase orders (500+)...");
    const statuses = ["DRAFT", "ORDERED", "PARTIALLY_RECEIVED", "RECEIVED"];
    let poCount = 0;

    for (let i = 0; i < 500; i++) {
      const supplier = randomChoice(suppliers);
      const user = randomChoice(allUsers);
      const status = randomChoice(statuses);
      const numItems = randomBetween(2, 8);

      const poItems = [];
      for (let j = 0; j < numItems; j++) {
        const product = randomChoice(products);
        const quantityOrdered = randomBetween(10, 200);
        const quantityReceived = status === "RECEIVED" ? quantityOrdered : randomBetween(0, quantityOrdered);

        poItems.push({
          productId: product.id,
          quantityOrdered,
          quantityReceived,
          unitCost: product.costPrice || randomBetween(5, 500),
        });
      }

      try {
        await prisma.purchaseOrder.create({
          data: {
            supplierId: supplier.id,
            status,
            expectedDate: new Date(Date.now() + randomBetween(1, 60) * 24 * 60 * 60 * 1000),
            createdById: user.id,
            items: {
              create: poItems,
            },
          },
        });
        poCount++;

        if ((i + 1) % 50 === 0) {
          console.log(`  → ${i + 1} purchase orders created`);
        }
      } catch (e) {
        // Continue on error
        continue;
      }
    }
    console.log(`✓ Created ${poCount} purchase orders`);

    // ============ SEED ALERTS (200+) ============
    console.log("⚠️  Seeding alerts (200+)...");
    const alertTypes = ["LOW_STOCK", "OVERSTOCK", "OUT_OF_STOCK", "OTHER"];
    let alertCount = 0;

    for (let i = 0; i < 200; i++) {
      const product = randomChoice(products);
      const alertType = randomChoice(alertTypes);

      try {
        await prisma.alert.create({
          data: {
            productId: product.id,
            type: alertType,
            message: `${alertType} alert for ${product.name}`,
            isResolved: Math.random() > 0.5,
            isRead: Math.random() > 0.3,
          },
        });
        alertCount++;

        if ((i + 1) % 50 === 0) {
          console.log(`  → ${i + 1} alerts created`);
        }
      } catch (e) {
        // Continue on error
        continue;
      }
    }
    console.log(`✓ Created ${alertCount} alerts`);

    // ============ SEED CYCLE COUNTS (50+) ============
    console.log("🔄 Seeding cycle counts (50+)...");
    let cycleCount = 0;

    for (let i = 0; i < 50; i++) {
      const user = randomChoice(allUsers);
      const numItems = randomBetween(10, 50);
      let totalShrinkageQty = 0;
      let totalShrinkageValue = 0;

      const cycleItems = [];
      for (let j = 0; j < numItems; j++) {
        const product = randomChoice(products);
        const expectedQty = randomBetween(50, 500);
        const countedQty = randomBetween(45, 510);
        const delta = countedQty - expectedQty;
        const valueDelta = delta * product.unitPrice;

        totalShrinkageQty += Math.max(0, -delta);
        totalShrinkageValue += Math.max(0, -valueDelta);

        cycleItems.push({
          productId: product.id,
          expectedQty,
          countedQty,
          delta,
          valueDelta: parseFloat(valueDelta.toFixed(2)),
        });
      }

      try {
        await prisma.cycleCount.create({
          data: {
            createdById: user.id,
            reason: `Scheduled cycle count #${i + 1}`,
            totalShrinkageQty,
            totalShrinkageValue: parseFloat(totalShrinkageValue.toFixed(2)),
            items: {
              create: cycleItems,
            },
          },
        });
        cycleCount++;

        if ((i + 1) % 10 === 0) {
          console.log(`  → ${i + 1} cycle counts created`);
        }
      } catch (e) {
        // Continue on error
        continue;
      }
    }
    console.log(`✓ Created ${cycleCount} cycle counts`);

    // ============ SEED ACTIVITY LOGS (2000+) ============
    console.log("📝 Seeding activity logs (2000+)...");
    const actions = [
      "PRODUCT_CREATED",
      "INVENTORY_UPDATED",
      "SALE_COMPLETED",
      "PO_CREATED",
      "STOCK_RECEIVED",
      "ALERT_RESOLVED",
      "REPORT_GENERATED",
    ];
    let activityCount = 0;

    for (let i = 0; i < 2000; i++) {
      const user = randomChoice(allUsers);
      const action = randomChoice(actions);

      try {
        await prisma.activityLog.create({
          data: {
            userId: user.id,
            action,
            description: `${action} activity log entry #${i + 1}`,
            ipAddress: `192.168.${randomBetween(1, 254)}.${randomBetween(1, 254)}`,
            status: Math.random() > 0.1 ? "success" : "failed",
          },
        });
        activityCount++;

        if ((i + 1) % 200 === 0) {
          console.log(`  → ${i + 1} activity logs created`);
        }
      } catch (e) {
        // Continue on error
        continue;
      }
    }
    console.log(`✓ Created ${activityCount} activity logs`);

    console.log("\n✅ Big data seed completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   • Categories: ${categories.length}`);
    console.log(`   • Suppliers: ${suppliers.length}`);
    console.log(`   • Products: ${createdCount}`);
    console.log(`   • Inventory Movements: ${movementCount}`);
    console.log(`   • Sales: ${saleCount}`);
    console.log(`   • Purchase Orders: ${poCount}`);
    console.log(`   • Alerts: ${alertCount}`);
    console.log(`   • Cycle Counts: ${cycleCount}`);
    console.log(`   • Activity Logs: ${activityCount}`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedBigData();
