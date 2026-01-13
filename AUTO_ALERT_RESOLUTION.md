# Auto Alert Resolution Feature

## Overview
When a manager creates a reorder (purchase order) in response to a LOW_STOCK or OUT_OF_STOCK alert, the system now **automatically resolves** the alert. This eliminates the need for manual alert dismissal and provides a better user experience.

## How It Works

### Backend Implementation

#### 1. Manual Purchase Order Creation
**File:** `Backend/controllers/purchaseOrderController.js`

When a manager creates a purchase order via the API (`POST /api/purchase-orders`), the system:

1. Creates the purchase order with all items
2. Automatically searches for unresolved LOW_STOCK and OUT_OF_STOCK alerts for each product in the order
3. Marks those alerts as **resolved** (not just read)
4. Updates the alert message to indicate the purchase order number and expected delivery date
5. Logs the number of alerts resolved

```javascript
// Auto-resolve alerts for items in the purchase order
for (const item of po.items) {
  if (item.product) {
    const resolvedCount = await prisma.alert.updateMany({
      where: {
        productId: item.productId,
        type: { in: ['LOW_STOCK', 'OUT_OF_STOCK'] },
        isResolved: false
      },
      data: {
        isResolved: true,  // Auto-resolve since action taken
        isRead: true,
        message: `${item.product.name} - Restock order placed (PO #${po.id}). Expected: ${expectedDate}`,
        updatedAt: new Date()
      }
    })
    
    if (resolvedCount.count > 0) {
      console.log(`✅ Auto-resolved ${resolvedCount.count} alert(s) for ${item.product.name}`)
    }
  }
}
```

#### 2. Auto Reorder Service
**File:** `Backend/services/autoReorderService.js`

When the auto-reorder system creates purchase orders automatically:

1. Detects products below reorder point with auto-reorder enabled
2. Creates purchase orders grouped by supplier
3. Automatically resolves related LOW_STOCK/OUT_OF_STOCK alerts
4. Logs activity for audit trail

```javascript
// Auto-resolve related alerts since auto-order created
for (const item of items) {
  const resolvedCount = await prisma.alert.updateMany({
    where: {
      productId: item.productId,
      type: { in: ['LOW_STOCK', 'OUT_OF_STOCK'] },
      isResolved: false,
    },
    data: {
      isResolved: true,
      isRead: true,
      message: prisma.raw(`message || ' (Auto-order PO#${purchaseOrder.id} created)'`),
    },
  });
}
```

### Frontend Implementation

#### Manager Alerts Page
**File:** `frontend/src/pages/manager/AlertsPage.tsx`

When a manager takes action on an alert:

1. **Reorder Action:** Creates purchase order → Backend auto-resolves alert → Frontend refreshes list
2. **Clearance Action:** Marks for clearance → Frontend manually resolves alert → Refreshes list

```typescript
const handleAction = async () => {
  if (actionType === 'reorder') {
    // Create purchase order
    await apiService.post('/purchase-orders', orderData);
    alert(`Purchase order created! Alert will be automatically resolved.`);
    
    // No manual resolution needed - backend handles it
    refetch?.(); // Refresh to show resolved alerts removed
  } else if (actionType === 'clearance') {
    // Clearance requires manual resolution
    await apiService.post(`/inventory/${selectedAlert.productId}/clearance`, {...});
    if (resolveAlert) {
      resolveAlert(selectedAlert.id);
    }
    refetch?.();
  }
};
```

## User Experience Flow

### Before (Manual Resolution)
```
1. Manager sees LOW_STOCK alert
2. Manager creates purchase order
3. Manager must manually click "Resolve" on alert
4. Alert disappears from list
```

### After (Auto Resolution) ✅
```
1. Manager sees LOW_STOCK alert
2. Manager creates purchase order
3. ✨ Alert automatically resolved by backend
4. Frontend refreshes - alert no longer appears
```

## Benefits

1. **Reduced Clicks:** No manual resolution step required
2. **Better UX:** Immediate feedback that action was taken
3. **Audit Trail:** Alert message updated with PO reference
4. **Consistency:** Works for both manual and auto-reorders
5. **Prevents Duplicate Actions:** Resolved alerts won't prompt duplicate reorders

## Alert Types Affected

| Alert Type | Auto-Resolved? | Trigger |
|------------|----------------|---------|
| LOW_STOCK | ✅ Yes | Purchase order created |
| OUT_OF_STOCK | ✅ Yes | Purchase order created |
| EXPIRY | ❌ No | Manual resolution only |
| OVERSTOCK | ❌ No | Manual resolution only |

## Testing

### Manual Test
1. Navigate to Manager Dashboard → Alerts
2. Find a LOW_STOCK or OUT_OF_STOCK alert
3. Click "Reorder" action
4. Fill in quantity and supplier
5. Submit purchase order
6. ✅ Alert should disappear from unresolved list automatically

### Automated Test
Run the test script:

```bash
cd Backend
node test-auto-alert-resolution.js
```

Expected output:
```
✅ SUCCESS: Alert automatically resolved when purchase order was created!
```

## Database Changes

### Alert Model Updates
```prisma
model Alert {
  id          Int      @id @default(autoincrement())
  productId   Int
  type        String   // LOW_STOCK, OUT_OF_STOCK, etc.
  message     String   // Updated with PO reference
  isResolved  Boolean  // Set to true automatically
  isRead      Boolean  // Set to true automatically
  updatedAt   DateTime @updatedAt
  // ... other fields
}
```

## API Endpoints

### Create Purchase Order
```
POST /api/purchase-orders
Authorization: Bearer <token>

Request:
{
  "supplierId": 1,
  "expectedDate": "2026-01-20",
  "items": [
    {
      "productId": 5,
      "quantity": 100,
      "unitCost": 25.00
    }
  ]
}

Response:
{
  "message": "Purchase order created.",
  "po": { ... }
}
```

**Side Effect:** All unresolved LOW_STOCK/OUT_OF_STOCK alerts for products in the order are automatically resolved.

### Get Unresolved Alerts
```
GET /api/alerts?isResolved=false
Authorization: Bearer <token>

Response:
{
  "data": [
    // Only includes alerts that haven't been auto-resolved
  ]
}
```

## Edge Cases Handled

1. **Multiple Alerts for Same Product:** All unresolved alerts for the product are resolved
2. **Partial Orders:** Only alerts for products included in the PO are resolved
3. **Auto-Reorder:** Works identically to manual orders
4. **Failed PO Creation:** If PO creation fails, alerts remain unresolved
5. **Already Resolved Alerts:** Ignored (only affects unresolved alerts)

## Future Enhancements

1. **Undo Resolution:** Allow managers to "unresolve" if PO is cancelled
2. **Resolution History:** Track when and why an alert was resolved
3. **Notification:** Email/SMS when alerts are auto-resolved
4. **Analytics:** Dashboard showing resolution rates and response times

## Related Files

### Backend
- `Backend/controllers/purchaseOrderController.js` - Manual PO creation with auto-resolution
- `Backend/services/autoReorderService.js` - Auto-reorder with auto-resolution
- `Backend/controllers/alertController.js` - Alert management APIs
- `Backend/test-auto-alert-resolution.js` - Automated test script

### Frontend
- `frontend/src/pages/manager/AlertsPage.tsx` - Manager alert management UI
- `frontend/src/pages/manager/RestockTrackingPage.tsx` - Purchase order tracking

### Database
- `Backend/prisma/schema.prisma` - Alert model definition

## Support

For issues or questions about this feature, check:
1. Console logs in backend for resolution confirmations
2. Network tab to verify PO creation response
3. Test script output for validation
4. Database directly: `SELECT * FROM Alert WHERE isResolved = true;`
