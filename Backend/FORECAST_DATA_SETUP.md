# Forecasting Data Setup Guide

## Overview
This guide explains how to populate your database with realistic historical sales data for accurate demand forecasting.

## Prerequisites
✅ PostgreSQL database running  
✅ Prisma schema migrated  
✅ Products and categories seeded  
✅ At least one admin/superadmin user  

## Quick Start

### 1. Seed Historical Sales Data (90 Days)
```bash
cd Backend
node seed-forecast-data.js
```

**What it does:**
- Generates 90 days of historical sales data (Oct 14, 2025 - Jan 12, 2026)
- Creates realistic sales patterns with:
  - Weekend spikes (20-50% increase)
  - Month-end boosts (people get paid)
  - Seasonal variations (holiday season boost)
  - Category-specific patterns
- Processes 100 products with 585 average sales each
- Total: ~58,000 sales, ~860,000 items sold

**Expected output:**
```
✅ Seeding Completed Successfully!
📊 Summary:
   Products processed: 100
   Total sales created: 58,541
   Total items sold: 861,978
   Days of history: 90
   Average sales per product: 585
```

### 2. Verify Data Readiness
```bash
node verify-forecast-readiness.js
```

**What it checks:**
- How many days of data each product has
- Which products are ready for forecasting (30+ days)
- Which products have optimal data (60+ days)
- Overall database readiness percentage

**Expected output:**
```
✅ Overall Readiness: 100%
✅ Database is ready for forecasting!
```

### 3. Test Single Forecast (Optional)
```bash
# Make sure backend is running first
npm run dev

# In another terminal:
node test-single-forecast.js
```

## Data Requirements

### Minimum Requirements
| Requirement | Minimum | Optimal | Purpose |
|-------------|---------|---------|---------|
| Historical Days | 30 | 90+ | Capture patterns & trends |
| Data Points | 30 | 60+ | Model training |
| Sales per Day | 2+ | 5+ | Statistical significance |

### Forecast Model Requirements
- **Linear Regression**: 30+ days
- **XGBoost**: 60+ days (recommended)
- **LSTM**: 90+ days (deep learning)

## Sales Pattern Configuration

The seed script creates realistic patterns based on product categories:

```javascript
const CATEGORY_PATTERNS = {
  'Food & Beverages': { avgSales: 25, variance: 10, weekendBoost: 1.3 },
  'Electronics': { avgSales: 8, variance: 5, weekendBoost: 1.2 },
  'Clothing': { avgSales: 12, variance: 6, weekendBoost: 1.4 },
  'Home & Garden': { avgSales: 10, variance: 4, weekendBoost: 1.1 },
  'Health & Beauty': { avgSales: 15, variance: 7, weekendBoost: 1.2 },
  'Sports & Outdoors': { avgSales: 9, variance: 5, weekendBoost: 1.5 },
}
```

### Pattern Features
1. **Base Demand**: Average daily sales for category
2. **Variance**: Random fluctuation range
3. **Weekend Boost**: Multiplier for Sat/Sun (1.1x - 1.5x)
4. **Month-End Boost**: 1.2x on days 25-31
5. **Seasonal Factor**: 
   - Nov-Dec: 1.3x (holiday season)
   - Jun-Aug: 1.1x (summer)
   - Other months: 1.0x

## Running Forecasts

### Option 1: Single Product Forecast
```bash
curl -X POST http://localhost:5001/api/forecast/run \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "horizon": 14}'
```

### Option 2: Bulk Forecast (All Products)
```bash
node trigger-all-forecasts.js
```

### Option 3: Via Manager Dashboard
1. Navigate to Manager Dashboard
2. Click on "Forecasts" section
3. Select product and forecast horizon
4. Click "Run Forecast"

## Troubleshooting

### "Not enough history" Error
**Problem**: Product has < 30 days of data

**Solutions:**
1. Run seed script again: `node seed-forecast-data.js`
2. Check specific product: `node verify-forecast-readiness.js`
3. Increase DAYS_OF_HISTORY in seed script

### "Forecasting service unavailable" (503)
**Problem**: Python FastAPI server not running

**Solution:**
```bash
cd Backend/forecast2
python app.py
# Or: uvicorn app:app --host 0.0.0.0 --port 5002
```

### Slow Seeding Performance
**Problem**: Seeding takes too long

**Solutions:**
1. Reduce products processed (edit `take: 100` in seed script)
2. Reduce DAYS_OF_HISTORY (from 90 to 60)
3. Use batch inserts (advanced)

### Duplicate Sales Error
**Problem**: Re-running seed creates duplicates

**Solution:**
```sql
-- Clear existing sales data
DELETE FROM "SaleItem";
DELETE FROM "Sale";
-- Then re-run seed script
```

## Database Schema

### Key Tables for Forecasting

#### Sale
```prisma
model Sale {
  id            Int        @id @default(autoincrement())
  totalAmount   Float
  paymentMethod String
  userId        Int
  createdAt     DateTime   @default(now())
  items         SaleItem[]
  user          User       @relation(fields: [userId], references: [id])
}
```

#### SaleItem
```prisma
model SaleItem {
  id         Int     @id @default(autoincrement())
  saleId     Int
  productId  Int
  quantity   Int
  unitPrice  Float
  total      Float
  sale       Sale    @relation(fields: [saleId], references: [id])
  product    Product @relation(fields: [productId], references: [id])
}
```

## Performance Metrics

### Seeding Performance
- **Products**: 100
- **Sales Created**: ~58,000
- **Items Created**: ~860,000
- **Time**: ~3-5 minutes
- **Database Size Increase**: ~50-100 MB

### Query Performance
- Historical data fetch: < 100ms
- Daily aggregation: < 200ms
- Forecast execution: 1-3 seconds

## Advanced Configuration

### Custom Date Range
Edit `seed-forecast-data.js`:
```javascript
const DAYS_OF_HISTORY = 180; // Change to 180 days (6 months)
const START_DATE = new Date('2025-07-16'); // Adjust start date
```

### Category-Specific Patterns
Add custom patterns for your categories:
```javascript
const CATEGORY_PATTERNS = {
  'Your Category': { 
    avgSales: 20, 
    variance: 8, 
    weekendBoost: 1.25 
  },
  // ... other categories
};
```

### Seed Specific Products Only
```javascript
const products = await prisma.product.findMany({
  where: {
    // Add filters here
    categoryId: 1, // Only category 1
    // OR
    id: { in: [1, 2, 3, 4, 5] } // Specific IDs
  },
  include: { category: true }
});
```

## Data Validation

### Check Data Quality
```sql
-- Products with sufficient data
SELECT 
  p.id, 
  p.name, 
  COUNT(DISTINCT DATE(s.createdAt)) as days_of_data,
  SUM(si.quantity) as total_quantity
FROM "Product" p
LEFT JOIN "SaleItem" si ON si."productId" = p.id
LEFT JOIN "Sale" s ON s.id = si."saleId"
WHERE s."createdAt" >= NOW() - INTERVAL '90 days'
GROUP BY p.id, p.name
HAVING COUNT(DISTINCT DATE(s.createdAt)) >= 30
ORDER BY days_of_data DESC;
```

### Verify Sales Distribution
```sql
-- Sales by day of week
SELECT 
  EXTRACT(DOW FROM s."createdAt") as day_of_week,
  COUNT(*) as num_sales,
  SUM(si.quantity) as total_quantity
FROM "Sale" s
JOIN "SaleItem" si ON si."saleId" = s.id
GROUP BY day_of_week
ORDER BY day_of_week;
```

## Best Practices

1. **Regular Updates**: Run seed monthly to maintain 90+ days of rolling data
2. **Backup First**: Always backup before bulk operations
3. **Monitor Performance**: Track seeding time and database size
4. **Validate Results**: Run verification script after seeding
5. **Test Forecasts**: Test a few products before bulk forecasting

## Support Files

| File | Purpose |
|------|---------|
| `seed-forecast-data.js` | Main seeding script |
| `verify-forecast-readiness.js` | Data validation |
| `test-single-forecast.js` | Test forecasting works |
| `trigger-all-forecasts.js` | Bulk forecast execution |
| `seed-historical-sales.js` | Legacy (single product) |
| `seed-all-product-history.js` | Legacy (30 days) |

## Next Steps

After successful seeding:

1. ✅ **Verify data**: `node verify-forecast-readiness.js`
2. ✅ **Start backend**: `npm run dev`
3. ✅ **Start Python service**: `cd forecast2 && python app.py`
4. ✅ **Test forecast**: `node test-single-forecast.js`
5. ✅ **Run bulk forecasts**: `node trigger-all-forecasts.js`
6. ✅ **View in dashboard**: Open Manager Portal → Forecasts

## Additional Resources

- [Forecasting Documentation](../ML_FORECASTING_IMPLEMENTATION.md)
- [Model Accuracy Testing](./forecast2/test_model_accuracy.py)
- [API Endpoints](../ENDPOINTS_SUMMARY.md)
- [Manager Portal Guide](../MANAGER_PORTAL_IMPLEMENTATION.md)
