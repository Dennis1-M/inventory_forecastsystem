import { prisma } from '../config/prisma.js';

// Kenyan supermarket categories
const categories = [
  { name: 'Dairy & Eggs' },
  { name: 'Beverages' },
  { name: 'Bakery' },
  { name: 'Fresh Produce' },
  { name: 'Meat & Poultry' },
  { name: 'Snacks & Confectionery' },
  { name: 'Canned & Packaged Foods' },
  { name: 'Personal Care' },
  { name: 'Household Items' },
  { name: 'Frozen Foods' },
  { name: 'Clothing & Textiles' },
  { name: 'Electronics' },
  { name: 'Baby Products' },
  { name: 'Health & Wellness' },
  { name: 'Stationery & Books' }
];

// Kenyan suppliers
const suppliers = [
  { name: 'Brookside Dairy' },
  { name: 'Bidco Africa' },
  { name: 'Coca-Cola Nairobi' },
  { name: 'Kenya Breweries Ltd' },
  { name: 'Farmers Choice' },
  { name: 'Procter & Gamble EA' },
  { name: 'Unilever Kenya' },
  { name: 'Pembe Flour Mills' },
  { name: 'Del Monte Kenya' },
  { name: 'Samsung East Africa' },
  { name: 'Safaricom Merchandise' },
  { name: 'Haco Industries' }
];

// Comprehensive Kenyan supermarket products
const products = [
  // Dairy & Eggs (Category 0)
  { name: 'Brookside Fresh Milk 500ml', sku: 'BRK-MLK-500', category: 0, supplier: 0, costPrice: 60, sellingPrice: 75, stock: 250, reorderLevel: 50, reorderQuantity: 200, unit: 'pieces', barcode: '6001087340014', expiryDays: 7 },
  { name: 'Brookside Fresh Milk 1L', sku: 'BRK-MLK-1L', category: 0, supplier: 0, costPrice: 110, sellingPrice: 135, stock: 300, reorderLevel: 60, reorderQuantity: 250, unit: 'pieces', barcode: '6001087340021', expiryDays: 7 },
  { name: 'Brookside Mala 500ml', sku: 'BRK-MAL-500', category: 0, supplier: 0, costPrice: 65, sellingPrice: 85, stock: 180, reorderLevel: 40, reorderQuantity: 150, unit: 'pieces', barcode: '6001087340038', expiryDays: 14 },
  { name: 'Tuzo UHT Milk 1L', sku: 'TUZ-UHT-1L', category: 0, supplier: 0, costPrice: 95, sellingPrice: 120, stock: 200, reorderLevel: 50, reorderQuantity: 180, unit: 'pieces', barcode: '6001087340045' },
  { name: 'Brookside Yoghurt 500g', sku: 'BRK-YOG-500', category: 0, supplier: 0, costPrice: 80, sellingPrice: 105, stock: 150, reorderLevel: 35, reorderQuantity: 120, unit: 'pieces', barcode: '6001087340052', expiryDays: 21 },
  { name: 'Fresh Eggs Tray (30pcs)', sku: 'EGG-TRY-30', category: 0, supplier: 4, costPrice: 380, sellingPrice: 450, stock: 100, reorderLevel: 20, reorderQuantity: 80, unit: 'trays', barcode: '6001087340069', expiryDays: 28 },

  // Beverages (Category 1)
  { name: 'Coca-Cola 500ml', sku: 'CCL-500', category: 1, supplier: 2, costPrice: 40, sellingPrice: 55, stock: 500, reorderLevel: 100, reorderQuantity: 400, unit: 'pieces', barcode: '5449000000996' },
  { name: 'Fanta Orange 500ml', sku: 'FNT-ORG-500', category: 1, supplier: 2, costPrice: 40, sellingPrice: 55, stock: 450, reorderLevel: 100, reorderQuantity: 400, unit: 'pieces', barcode: '5449000001016' },
  { name: 'Sprite 500ml', sku: 'SPR-500', category: 1, supplier: 2, costPrice: 40, sellingPrice: 55, stock: 400, reorderLevel: 100, reorderQuantity: 350, unit: 'pieces', barcode: '5449000001023' },
  { name: 'Tusker Lager 500ml', sku: 'TSK-LGR-500', category: 1, supplier: 3, costPrice: 140, sellingPrice: 180, stock: 300, reorderLevel: 60, reorderQuantity: 250, unit: 'pieces', barcode: '6001087340076' },
  { name: 'Keringet Water 500ml', sku: 'KRG-WTR-500', category: 1, supplier: 2, costPrice: 30, sellingPrice: 45, stock: 600, reorderLevel: 120, reorderQuantity: 500, unit: 'pieces', barcode: '6001087340083' },
  { name: 'Del Monte Juice 1L', sku: 'DLM-JCE-1L', category: 1, supplier: 8, costPrice: 130, sellingPrice: 170, stock: 200, reorderLevel: 40, reorderQuantity: 180, unit: 'pieces', barcode: '6001087340090', expiryDays: 180 },
  { name: 'Ketepa Tea Bags 100s', sku: 'KTP-TEA-100', category: 1, supplier: 11, costPrice: 180, sellingPrice: 230, stock: 150, reorderLevel: 30, reorderQuantity: 120, unit: 'boxes', barcode: '6001087340106' },

  // Bakery (Category 2)
  { name: 'Supa Loaf 400g', sku: 'SUP-BRD-400', category: 2, supplier: 7, costPrice: 45, sellingPrice: 60, stock: 200, reorderLevel: 40, reorderQuantity: 180, unit: 'pieces', barcode: '6001087340113', expiryDays: 5 },
  { name: 'Festive White Bread 800g', sku: 'FST-WHT-800', category: 2, supplier: 7, costPrice: 85, sellingPrice: 110, stock: 180, reorderLevel: 35, reorderQuantity: 150, unit: 'pieces', barcode: '6001087340120', expiryDays: 5 },
  { name: 'Croissants Pack of 4', sku: 'CRS-PCK-4', category: 2, supplier: 7, costPrice: 120, sellingPrice: 160, stock: 100, reorderLevel: 20, reorderQuantity: 80, unit: 'packs', barcode: '6001087340137', expiryDays: 3 },

  // Fresh Produce (Category 3)
  { name: 'Tomatoes per Kg', sku: 'TMT-KG', category: 3, supplier: 8, costPrice: 60, sellingPrice: 90, stock: 80, reorderLevel: 15, reorderQuantity: 70, unit: 'kg', barcode: '6001087340144', expiryDays: 7 },
  { name: 'Onions per Kg', sku: 'ONI-KG', category: 3, supplier: 8, costPrice: 55, sellingPrice: 80, stock: 100, reorderLevel: 20, reorderQuantity: 90, unit: 'kg', barcode: '6001087340151', expiryDays: 14 },
  { name: 'Potatoes per Kg', sku: 'POT-KG', category: 3, supplier: 8, costPrice: 50, sellingPrice: 75, stock: 120, reorderLevel: 25, reorderQuantity: 100, unit: 'kg', barcode: '6001087340168', expiryDays: 21 },
  { name: 'Bananas per Kg', sku: 'BNN-KG', category: 3, supplier: 8, costPrice: 70, sellingPrice: 100, stock: 90, reorderLevel: 20, reorderQuantity: 80, unit: 'kg', barcode: '6001087340175', expiryDays: 7 },
  { name: 'Oranges per Kg', sku: 'ORG-KG', category: 3, supplier: 8, costPrice: 80, sellingPrice: 120, stock: 70, reorderLevel: 15, reorderQuantity: 60, unit: 'kg', barcode: '6001087340182', expiryDays: 10 },

  // Meat & Poultry (Category 4)
  { name: 'Farmers Choice Sausages 500g', sku: 'FMC-SSG-500', category: 4, supplier: 4, costPrice: 180, sellingPrice: 240, stock: 150, reorderLevel: 30, reorderQuantity: 120, unit: 'packs', barcode: '6001087340199', expiryDays: 14 },
  { name: 'Chicken Breast per Kg', sku: 'CHK-BRT-KG', category: 4, supplier: 4, costPrice: 350, sellingPrice: 480, stock: 80, reorderLevel: 20, reorderQuantity: 70, unit: 'kg', barcode: '6001087340205', expiryDays: 5 },
  { name: 'Beef Steak per Kg', sku: 'BEF-STK-KG', category: 4, supplier: 4, costPrice: 550, sellingPrice: 750, stock: 60, reorderLevel: 15, reorderQuantity: 50, unit: 'kg', barcode: '6001087340212', expiryDays: 5 },

  // Snacks & Confectionery (Category 5)
  { name: 'Pringles Original 160g', sku: 'PRG-ORG-160', category: 5, supplier: 5, costPrice: 180, sellingPrice: 250, stock: 200, reorderLevel: 40, reorderQuantity: 180, unit: 'pieces', barcode: '5053990101999' },
  { name: 'Lays Chips 125g', sku: 'LAY-CHP-125', category: 5, supplier: 5, costPrice: 95, sellingPrice: 130, stock: 300, reorderLevel: 60, reorderQuantity: 250, unit: 'pieces', barcode: '6001087340229' },
  { name: 'Cadbury Dairy Milk 80g', sku: 'CDB-DRY-80', category: 5, supplier: 6, costPrice: 120, sellingPrice: 165, stock: 250, reorderLevel: 50, reorderQuantity: 200, unit: 'pieces', barcode: '6001087340236' },
  { name: 'KitKat 4 Finger 41.5g', sku: 'KTK-4FG-41', category: 5, supplier: 6, costPrice: 55, sellingPrice: 80, stock: 400, reorderLevel: 80, reorderQuantity: 350, unit: 'pieces', barcode: '6001087340243' },
  { name: 'Mentos Mint Roll', sku: 'MNT-MNT-RL', category: 5, supplier: 6, costPrice: 25, sellingPrice: 40, stock: 500, reorderLevel: 100, reorderQuantity: 450, unit: 'pieces', barcode: '6001087340250' },

  // Canned & Packaged Foods (Category 6)
  { name: 'Pembe Maize Flour 2Kg', sku: 'PMB-MZF-2K', category: 6, supplier: 7, costPrice: 135, sellingPrice: 180, stock: 200, reorderLevel: 40, reorderQuantity: 180, unit: 'packs', barcode: '6001087340267' },
  { name: 'Pishori Rice 2Kg', sku: 'PSH-RCE-2K', category: 6, supplier: 7, costPrice: 240, sellingPrice: 310, stock: 150, reorderLevel: 30, reorderQuantity: 130, unit: 'packs', barcode: '6001087340274' },
  { name: 'Pasta Spaghetti 500g', sku: 'PST-SPG-500', category: 6, supplier: 7, costPrice: 85, sellingPrice: 120, stock: 180, reorderLevel: 35, reorderQuantity: 150, unit: 'packs', barcode: '6001087340281' },
  { name: 'Corn Flakes 500g', sku: 'CRN-FLK-500', category: 6, supplier: 6, costPrice: 230, sellingPrice: 310, stock: 120, reorderLevel: 25, reorderQuantity: 100, unit: 'boxes', barcode: '6001087340298' },
  { name: 'Baked Beans 400g Can', sku: 'BKD-BNS-400', category: 6, supplier: 11, costPrice: 75, sellingPrice: 105, stock: 200, reorderLevel: 40, reorderQuantity: 180, unit: 'cans', barcode: '6001087340304' },
  { name: 'Cooking Oil 2L', sku: 'CKG-OIL-2L', category: 6, supplier: 1, costPrice: 380, sellingPrice: 490, stock: 150, reorderLevel: 30, reorderQuantity: 130, unit: 'bottles', barcode: '6001087340311' },

  // Personal Care (Category 7)
  { name: 'Colgate Toothpaste 175ml', sku: 'CLG-TPT-175', category: 7, supplier: 6, costPrice: 180, sellingPrice: 245, stock: 200, reorderLevel: 40, reorderQuantity: 180, unit: 'pieces', barcode: '6001087340328' },
  { name: 'Geisha Soap 200g', sku: 'GSH-SOP-200', category: 7, supplier: 1, costPrice: 45, sellingPrice: 65, stock: 350, reorderLevel: 70, reorderQuantity: 300, unit: 'pieces', barcode: '6001087340335' },
  { name: 'Nivea Body Lotion 400ml', sku: 'NVA-LOT-400', category: 7, supplier: 6, costPrice: 380, sellingPrice: 520, stock: 120, reorderLevel: 25, reorderQuantity: 100, unit: 'bottles', barcode: '6001087340342' },
  { name: 'Always Ultra Pads 10s', sku: 'ALW-ULT-10', category: 7, supplier: 5, costPrice: 145, sellingPrice: 195, stock: 180, reorderLevel: 35, reorderQuantity: 150, unit: 'packs', barcode: '6001087340359' },
  { name: 'Menengai Tissue Roll 10s', sku: 'MNG-TSU-10', category: 7, supplier: 11, costPrice: 280, sellingPrice: 370, stock: 150, reorderLevel: 30, reorderQuantity: 130, unit: 'packs', barcode: '6001087340366' },

  // Household Items (Category 8)
  { name: 'OMO Washing Powder 1Kg', sku: 'OMO-WSH-1K', category: 8, supplier: 6, costPrice: 280, sellingPrice: 370, stock: 180, reorderLevel: 35, reorderQuantity: 150, unit: 'boxes', barcode: '6001087340373' },
  { name: 'Vim Scouring Powder 500g', sku: 'VIM-SCR-500', category: 8, supplier: 6, costPrice: 65, sellingPrice: 90, stock: 200, reorderLevel: 40, reorderQuantity: 180, unit: 'pieces', barcode: '6001087340380' },
  { name: 'JIK Bleach 750ml', sku: 'JIK-BLC-750', category: 8, supplier: 11, costPrice: 85, sellingPrice: 120, stock: 150, reorderLevel: 30, reorderQuantity: 130, unit: 'bottles', barcode: '6001087340397' },
  { name: 'Sunlight Dishwash 750ml', sku: 'SNL-DSH-750', category: 8, supplier: 6, costPrice: 95, sellingPrice: 135, stock: 180, reorderLevel: 35, reorderQuantity: 150, unit: 'bottles', barcode: '6001087340403' },

  // Frozen Foods (Category 9)
  { name: 'Farmers Choice Chicken Wings 1Kg', sku: 'FMC-WNG-1K', category: 9, supplier: 4, costPrice: 420, sellingPrice: 550, stock: 100, reorderLevel: 20, reorderQuantity: 90, unit: 'packs', barcode: '6001087340410', expiryDays: 90 },
  { name: 'Ice Cream Tub 1L', sku: 'ICE-TUB-1L', category: 9, supplier: 0, costPrice: 280, sellingPrice: 380, stock: 80, reorderLevel: 15, reorderQuantity: 70, unit: 'tubs', barcode: '6001087340427', expiryDays: 120 },

  // Clothing & Textiles (Category 10)
  { name: 'Cotton T-Shirt Medium', sku: 'CTN-TSH-M', category: 10, supplier: 10, costPrice: 350, sellingPrice: 500, stock: 60, reorderLevel: 10, reorderQuantity: 50, unit: 'pieces', barcode: '6001087340434' },
  { name: 'Bath Towel 70x140cm', sku: 'BTH-TWL-70', category: 10, supplier: 10, costPrice: 450, sellingPrice: 650, stock: 50, reorderLevel: 10, reorderQuantity: 40, unit: 'pieces', barcode: '6001087340441' },
  { name: 'Bed Sheet Set Queen', sku: 'BED-SHT-Q', category: 10, supplier: 10, costPrice: 1200, sellingPrice: 1700, stock: 30, reorderLevel: 5, reorderQuantity: 25, unit: 'sets', barcode: '6001087340458' },
  { name: 'Cotton Socks 3-Pack', sku: 'CTN-SCK-3', category: 10, supplier: 10, costPrice: 280, sellingPrice: 400, stock: 80, reorderLevel: 15, reorderQuantity: 70, unit: 'packs', barcode: '6001087340465' },

  // Electronics (Category 11)
  { name: 'Samsung Earphones', sku: 'SMS-ERP', category: 11, supplier: 9, costPrice: 650, sellingPrice: 950, stock: 50, reorderLevel: 10, reorderQuantity: 40, unit: 'pieces', barcode: '6001087340472' },
  { name: 'Eveready AA Batteries 4pk', sku: 'EVR-BAT-AA4', category: 11, supplier: 9, costPrice: 180, sellingPrice: 260, stock: 150, reorderLevel: 30, reorderQuantity: 130, unit: 'packs', barcode: '6001087340489' },
  { name: 'USB Cable Type-C 1m', sku: 'USB-TPC-1M', category: 11, supplier: 9, costPrice: 280, sellingPrice: 420, stock: 100, reorderLevel: 20, reorderQuantity: 90, unit: 'pieces', barcode: '6001087340496' },
  { name: 'Phone Holder Car Mount', sku: 'PHN-HLD-CM', category: 11, supplier: 9, costPrice: 450, sellingPrice: 680, stock: 60, reorderLevel: 12, reorderQuantity: 50, unit: 'pieces', barcode: '6001087340502' },

  // Baby Products (Category 12)
  { name: 'Pampers Baby Dry Size 3 (50s)', sku: 'PMP-DRY-S3-50', category: 12, supplier: 5, costPrice: 1150, sellingPrice: 1500, stock: 80, reorderLevel: 15, reorderQuantity: 70, unit: 'packs', barcode: '6001087340519' },
  { name: 'Baby Wipes 80s', sku: 'BBY-WIP-80', category: 12, supplier: 5, costPrice: 180, sellingPrice: 250, stock: 120, reorderLevel: 25, reorderQuantity: 100, unit: 'packs', barcode: '6001087340526' },
  { name: 'Cerelac Baby Cereal 400g', sku: 'CRL-CRL-400', category: 12, supplier: 6, costPrice: 320, sellingPrice: 430, stock: 90, reorderLevel: 18, reorderQuantity: 80, unit: 'boxes', barcode: '6001087340533', expiryDays: 365 },

  // Health & Wellness (Category 13)
  { name: 'Panadol Tablets 24s', sku: 'PND-TAB-24', category: 13, supplier: 11, costPrice: 130, sellingPrice: 180, stock: 200, reorderLevel: 40, reorderQuantity: 180, unit: 'boxes', barcode: '6001087340540' },
  { name: 'Vitamin C 1000mg 30s', sku: 'VTC-1000-30', category: 13, supplier: 11, costPrice: 450, sellingPrice: 620, stock: 80, reorderLevel: 15, reorderQuantity: 70, unit: 'bottles', barcode: '6001087340557' },
  { name: 'First Aid Kit', sku: 'FRS-AID-KT', category: 13, supplier: 11, costPrice: 650, sellingPrice: 900, stock: 50, reorderLevel: 10, reorderQuantity: 40, unit: 'kits', barcode: '6001087340564' },

  // Stationery & Books (Category 14)
  { name: 'A4 Exercise Book 200 Pages', sku: 'A4-EXC-200', category: 14, supplier: 11, costPrice: 85, sellingPrice: 125, stock: 150, reorderLevel: 30, reorderQuantity: 130, unit: 'pieces', barcode: '6001087340571' },
  { name: 'Bic Pens Pack of 10', sku: 'BIC-PEN-10', category: 14, supplier: 11, costPrice: 95, sellingPrice: 140, stock: 200, reorderLevel: 40, reorderQuantity: 180, unit: 'packs', barcode: '6001087340588' },
  { name: 'Daily Nation Newspaper', sku: 'DLY-NTN-NWS', category: 14, supplier: 11, costPrice: 45, sellingPrice: 60, stock: 100, reorderLevel: 20, reorderQuantity: 90, unit: 'pieces', barcode: '6001087340595', expiryDays: 1 },
];

// Generate realistic sales data with patterns
function generateSalesData(products, startDate, days) {
  const sales = [];
  const currentDate = new Date(startDate);

  for (let day = 0; day < days; day++) {
    const dayOfWeek = currentDate.getDay(); // 0=Sunday, 6=Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isMonday = dayOfWeek === 1;

    // More sales on weekends and Mondays
    const dailyTransactions = isWeekend ? 80 + Math.floor(Math.random() * 40) : 
                               isMonday ? 70 + Math.floor(Math.random() * 30) : 
                               50 + Math.floor(Math.random() * 30);

    for (let txn = 0; txn < dailyTransactions; txn++) {
      // Peak hours: 8-10am, 5-7pm
      const hour = Math.random() < 0.4 ? (Math.random() < 0.5 ? 8 + Math.floor(Math.random() * 3) : 17 + Math.floor(Math.random() * 3)) 
                                        : 10 + Math.floor(Math.random() * 9);
      
      const saleTime = new Date(currentDate);
      saleTime.setHours(hour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));

      // Random product selection with weighted probability
      const productIndex = Math.floor(Math.pow(Math.random(), 1.5) * products.length);
      const product = products[productIndex];

      // Quantity varies by product type
      let quantity;
      if (product.category <= 2) { // Dairy, Beverages, Bakery - higher volume
        quantity = 1 + Math.floor(Math.random() * 4);
      } else if (product.category === 5) { // Snacks - medium volume
        quantity = 1 + Math.floor(Math.random() * 3);
      } else if (product.category >= 10) { // Clothing, Electronics - lower volume
        quantity = Math.random() < 0.7 ? 1 : 2;
      } else {
        quantity = 1 + Math.floor(Math.random() * 2);
      }

      const paymentMethods = ['CASH', 'MPESA', 'CARD'];
      const paymentWeights = [0.4, 0.45, 0.15]; // MPESA most popular in Kenya
      const randomPayment = Math.random();
      let paymentMethod = 'CASH';
      if (randomPayment < 0.45) paymentMethod = 'MPESA';
      else if (randomPayment < 0.60) paymentMethod = 'CASH';
      else paymentMethod = 'CARD';

      sales.push({
        productIndex: productIndex,
        quantity: quantity,
        totalAmount: product.sellingPrice * quantity,
        paymentMethod: paymentMethod,
        saleDate: new Date(saleTime)
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return sales;
}

async function main() {
  console.log('🚀 Starting Kenyan supermarket data seeding...');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.sale.deleteMany({});
    await prisma.alert.deleteMany({});
    await prisma.purchaseOrderItem.deleteMany({});
    await prisma.purchaseOrder.deleteMany({});
    await prisma.forecastPoint.deleteMany({});
    await prisma.forecastRun.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.supplier.deleteMany({});
    await prisma.category.deleteMany({});

    // Create categories
    console.log('📁 Creating categories...');
    const createdCategories = [];
    for (const cat of categories) {
      const category = await prisma.category.create({ data: cat });
      createdCategories.push(category);
    }
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create suppliers
    console.log('🏭 Creating suppliers...');
    const createdSuppliers = [];
    for (const sup of suppliers) {
      const supplier = await prisma.supplier.create({ data: sup });
      createdSuppliers.push(supplier);
    }
    console.log(`✅ Created ${createdSuppliers.length} suppliers`);

    // Create products
    console.log('📦 Creating products...');
    const createdProducts = [];
    for (const prod of products) {
      const expiryDate = prod.expiryDays 
        ? new Date(Date.now() + prod.expiryDays * 24 * 60 * 60 * 1000) 
        : null;

      const product = await prisma.product.create({
        data: {
          name: prod.name,
          sku: prod.sku,
          description: `${prod.name} - Premium quality product`,
          categoryId: createdCategories[prod.category].id,
          supplierId: createdSuppliers[prod.supplier].id,
          unitPrice: prod.sellingPrice,
          costPrice: prod.costPrice,
          currentStock: prod.stock,
          lowStockThreshold: prod.reorderLevel,
          expiryDate: expiryDate
        }
      });
      createdProducts.push(product);
    }
    console.log(`✅ Created ${createdProducts.length} products`);

    // Generate 90 days of sales history
    console.log('💰 Generating 90 days of sales history...');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    
    const salesData = generateSalesData(products, startDate, 90);
    console.log(`📊 Generated ${salesData.length} sales transactions`);

    // Batch insert sales (in chunks to avoid memory issues)
    const batchSize = 500;
    let salesCreated = 0;
    
    for (let i = 0; i < salesData.length; i += batchSize) {
      const batch = salesData.slice(i, i + batchSize);
      await prisma.sale.createMany({
        data: batch.map(sale => ({
          productId: createdProducts[sale.productIndex].id,
          quantity: sale.quantity,
          totalAmount: sale.totalAmount,
          paymentMethod: sale.paymentMethod,
          saleDate: sale.saleDate
        }))
      });
      salesCreated += batch.length;
      console.log(`   Created ${salesCreated}/${salesData.length} sales...`);
    }
    console.log(`✅ Created ${salesCreated} sales records`);

    // Create some purchase orders
    console.log('📝 Creating purchase orders...');
    const poStatuses = ['PENDING', 'APPROVED', 'RECEIVED', 'CANCELLED'];
    const purchaseOrders = [];

    for (let i = 0; i < 20; i++) {
      const randomSupplier = createdSuppliers[Math.floor(Math.random() * createdSuppliers.length)];
      const status = poStatuses[Math.floor(Math.random() * poStatuses.length)];
      
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 60));

      purchaseOrders.push({
        supplierId: randomSupplier.id,
        orderDate: orderDate,
        expectedDeliveryDate: new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: status,
        totalAmount: 5000 + Math.floor(Math.random() * 95000),
        notes: `Purchase order for ${randomSupplier.name}`
      });
    }

    await prisma.purchaseOrder.createMany({ data: purchaseOrders });
    console.log(`✅ Created ${purchaseOrders.length} purchase orders`);

    // Create alerts for low stock and expiring items
    console.log('🚨 Creating alerts...');
    const alerts = [];

    // Low stock alerts
    for (const product of createdProducts) {
      if (product.currentStock <= product.lowStockThreshold) {
        alerts.push({
          productId: product.id,
          type: 'LOW_STOCK',
          severity: product.currentStock === 0 ? 'HIGH' : 'MEDIUM',
          message: `${product.name} is running low (${product.currentStock} units remaining)`,
          isRead: false
        });
      }
    }

    // Expiry alerts
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    for (const product of createdProducts) {
      if (product.expiryDate) {
        const daysUntilExpiry = Math.ceil((product.expiryDate - now) / (24 * 60 * 60 * 1000));
        
        if (daysUntilExpiry <= 0) {
          alerts.push({
            productId: product.id,
            type: 'EXPIRED',
            severity: 'CRITICAL',
            message: `${product.name} has expired!`,
            isRead: false
          });
        } else if (daysUntilExpiry <= 7) {
          alerts.push({
            productId: product.id,
            type: 'EXPIRING_SOON',
            severity: 'HIGH',
            message: `${product.name} expires in ${daysUntilExpiry} days`,
            isRead: false
          });
        }
      }
    }

    if (alerts.length > 0) {
      await prisma.alert.createMany({ data: alerts });
      console.log(`✅ Created ${alerts.length} alerts`);
    }

    // Summary statistics
    console.log('\n📊 SEEDING SUMMARY:');
    console.log(`   Categories: ${createdCategories.length}`);
    console.log(`   Suppliers: ${createdSuppliers.length}`);
    console.log(`   Products: ${createdProducts.length}`);
    console.log(`   Sales: ${salesCreated}`);
    console.log(`   Purchase Orders: ${purchaseOrders.length}`);
    console.log(`   Alerts: ${alerts.length}`);
    
    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    console.log(`   Total Revenue (90 days): KES ${totalRevenue.toLocaleString()}`);
    console.log(`   Avg Daily Revenue: KES ${Math.round(totalRevenue / 90).toLocaleString()}`);

    console.log('\n✅ Kenyan supermarket data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
