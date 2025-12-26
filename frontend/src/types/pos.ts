export interface Product {
  id: string;
  sku: string;
  name: string;
  unitPrice: number;
  currentStock: number;
  lowStockThreshold: number;
  category?: string;
}

export interface CartItem {
  product: {
    id: string;        
    name: string;
    unitPrice: number;
    currentStock: number;
  };
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF';
}


export type PaymentMethod = 'CASH' | 'MPESA' | 'CARD';

export interface Sale {
  id: string;
  productId: string;
  quantitySold: number;
  unitPriceSold: number;
  totalSaleAmount: number;
  saleDate: Date;
  userId: string;
  paymentMethod: PaymentMethod;
}

export interface Receipt {
  saleId: number;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
}


export interface InventoryMovement {
  id: string;
  productId: string;
  type: 'SALE' | 'SALE_REVERSAL' | 'RESTOCK' | 'ADJUSTMENT';
  quantityChange: number;
  timestamp: Date;
  userId: string;
  saleId?: string;
}

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export const getStockStatus = (product: Product): StockStatus => {
  if (product.currentStock <= 0) return 'out-of-stock';
  if (product.currentStock <= product.lowStockThreshold) return 'low-stock';
  return 'in-stock';
};
