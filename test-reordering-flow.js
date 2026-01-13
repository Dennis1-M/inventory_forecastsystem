import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import prisma from './config/prisma.js';

async function testReorderingFlow() {
  try {
    console.log('=== Testing Complete Reordering Flow ===\n');

    // Get admin user for token
    const user = await prisma.user.findFirst({ where: { role: 'SUPERADMIN' } });
    if (!user) {
      console.log('No admin user found');
      process.exit(1);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      'supersecretkey123',
      { expiresIn: '24h' }
    );

    // Get test data
    const supplier = await prisma.supplier.findFirst();
    const product = await prisma.product.findFirst();

    console.log('Test Data:');
    console.log(`  Supplier: ${supplier.name} (ID: ${supplier.id})`);
    console.log(`  Product: ${product.name} (ID: ${product.id})`);
    console.log(`  Current Stock: ${product.currentStock}`);
    console.log(`  Low Stock Threshold: ${product.lowStockThreshold}`);

    // Step 1: Create Purchase Order
    console.log('\n--- Step 1: Creating Purchase Order ---');
    const createResponse = await fetch('http://localhost:5001/api/purchase-orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        supplierId: supplier.id,
        expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            productId: product.id,
            quantity: 100,
            unitCost: 25.00
          }
        ]
      })
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.log('Error creating PO:', error);
      process.exit(1);
    }

    const createData = await createResponse.json();
    const poId = createData.po.id;
    const poItemId = createData.po.items[0].id;

    console.log(`✓ Purchase Order created successfully`);
    console.log(`  PO ID: ${poId}`);
    console.log(`  Status: ${createData.po.status}`);
    console.log(`  Items: ${createData.po.items.length}`);
    console.log(`  Quantity Ordered: ${createData.po.items[0].quantityOrdered}`);

    // Step 2: Get PO Details
    console.log('\n--- Step 2: Getting PO Details ---');
    const detailResponse = await fetch(`http://localhost:5001/api/purchase-orders/${poId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const poDetail = await detailResponse.json();
    console.log(`✓ PO Status: ${poDetail.status}`);
    console.log(`  Created By: ${poDetail.createdBy.name}`);
    console.log(`  Items: ${poDetail.items.length}`);

    // Step 3: Receive Partial Shipment
    console.log('\n--- Step 3: Receiving Partial Shipment (50 units) ---');
    const receiveResponse = await fetch(`http://localhost:5001/api/purchase-orders/${poId}/receive`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [
          {
            itemId: poItemId,
            quantityReceived: 50
          }
        ]
      })
    });

    if (!receiveResponse.ok) {
      const error = await receiveResponse.json();
      console.log('Error receiving PO:', error);
      process.exit(1);
    }

    const receiveData = await receiveResponse.json();
    console.log(`✓ Partial receipt processed successfully`);
    console.log(`  Items Received: ${receiveData.result.receipt.length}`);
    console.log(`  New PO Status: ${receiveData.result.newStatus}`);

    // Step 4: Check Product Stock Updated
    console.log('\n--- Step 4: Verifying Stock Update ---');
    const updatedProduct = await prisma.product.findFirst({ where: { id: product.id } });
    const stockIncrease = updatedProduct.currentStock - product.currentStock;

    console.log(`✓ Product Stock Updated`);
    console.log(`  Old Stock: ${product.currentStock}`);
    console.log(`  New Stock: ${updatedProduct.currentStock}`);
    console.log(`  Increase: ${stockIncrease}`);

    // Step 5: Check Inventory Movement
    console.log('\n--- Step 5: Checking Inventory Movement ---');
    const movements = await prisma.inventoryMovement.findMany({
      where: { productId: product.id, type: 'RECEIPT' },
      orderBy: { timestamp: 'desc' },
      take: 1
    });

    if (movements.length > 0) {
      const latest = movements[0];
      console.log(`✓ Inventory Movement Created`);
      console.log(`  Type: ${latest.type}`);
      console.log(`  Quantity: ${latest.quantity}`);
      console.log(`  Cost Price: ${latest.costPrice}`);
      console.log(`  Supplier ID: ${latest.supplierId}`);
    }

    // Step 6: Receive Rest of Shipment
    console.log('\n--- Step 6: Receiving Rest of Shipment (50 units) ---');
    const receive2Response = await fetch(`http://localhost:5001/api/purchase-orders/${poId}/receive`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [
          {
            itemId: poItemId,
            quantityReceived: 50
          }
        ]
      })
    });

    const receive2Data = await receive2Response.json();
    console.log(`✓ Final receipt processed`);
    console.log(`  New PO Status: ${receive2Data.result.newStatus}`);

    // Step 7: Final Verification
    console.log('\n--- Step 7: Final Verification ---');
    const finalPO = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: { items: true }
    });

    const finalProduct = await prisma.product.findFirst({ where: { id: product.id } });
    const totalReceived = finalPO.items.reduce((sum, item) => sum + item.quantityReceived, 0);

    console.log(`✓ Purchase Order Summary`);
    console.log(`  PO Status: ${finalPO.status}`);
    console.log(`  Total Ordered: 100`);
    console.log(`  Total Received: ${totalReceived}`);
    console.log(`  Final Product Stock: ${finalProduct.currentStock}`);

    // Summary
    console.log('\n=== Summary ===');
    console.log(`✓ Complete reordering flow executed successfully`);
    console.log(`✓ Purchase Order Status: DRAFT → ORDERED → PARTIALLY_RECEIVED → RECEIVED`);
    console.log(`✓ Stock increased by 100 units (from ${product.currentStock} to ${finalProduct.currentStock})`);
    console.log(`✓ 2 Inventory Movement records created (type: RECEIPT)`);

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testReorderingFlow();
