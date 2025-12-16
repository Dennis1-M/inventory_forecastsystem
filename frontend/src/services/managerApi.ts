// src/services/managerApi.ts - COMPLETE VERSION
import { apiFetch } from './api';

// Types based on your Prisma schema
export type Role = 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF';
export type MovementType = 'RECEIPT' | 'SALE' | 'SALE_REVERSAL' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffMember extends User {
  department?: string;
  position?: string;
}

export interface UrgentTask {
  id: number;
  title: string;
  type: 'stock_request' | 'staff_assignment' | 'inventory_check' | 'order_issue';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  unitPrice: number;
  currentStock: number;
  lowStockThreshold: number;
  reorderPoint: number;
  overStockLimit: number;
  categoryId: number;
  supplierId?: number;
  category: {
    id: number;
    name: string;
  };
  supplier?: {
    id: number;
    name: string;
  };
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Supplier {
  id: number;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface Sale {
  id: number;
  productId: number;
  quantitySold: number;
  unitPriceSold: number;
  totalSaleAmount: number;
  saleDate: string;
  notes?: string;
  product: Product;
  userId: number;
  user: User;
}

export interface InventoryMovement {
  id: number;
  productId: number;
  type: MovementType;
  quantity: number;
  costPrice?: number;
  description?: string;
  timestamp: string;
  userId: number;
  supplierId?: number;
  product: Product;
  user: User;
  supplier?: Supplier;
}

export interface Alert {
  id: number;
  productId: number;
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK';
  message: string;
  createdAt: string;
  isResolved: boolean;
  product: Product;
}

// Manager-specific interfaces
export interface DashboardStats {
  pendingOrders: number;
  lowStockItems: number;
  activeStaff: number;
  totalStaff: number;
  pendingTasks: number;
  todayShipments: number;
  warehouseUtilization: number;
  orderAccuracy: number;
  totalSales: number;
  totalInventoryValue: number;
}

export interface ManagerTask {
  id: number;
  title: string;
  description: string;
  assignedTo: number; // user_id
  assignedToName: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  taskType: string;
  estimatedHours: number;
  createdAt: string;
  createdBy: number;
}

export interface StockRequest {
  id: number;
  productId: number;
  productName: string;
  quantityRequested: number;
  urgency: 'low' | 'medium' | 'high';
  reason: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'ordered' | 'received';
  requestedBy: number;
  requestedAt: string;
  approvedBy?: number;
  approvedAt?: string;
}

export interface WarehouseLocation {
  id: number;
  name: string;
  capacity: number;
  used: number;
}

export interface WarehouseStatus {
  utilization: number;
  totalValue: number;
  productCount: number;
  lowStockCount: number;
  overStockCount: number;
}

// Logging utility
const logOperation = (operation: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const userId = localStorage.getItem('userId') || 'unknown';
  console.log(`[${timestamp}] [User:${userId}] ${operation}`, details || '');
};

const logError = (operation: string, error: any) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR in ${operation}:`, error);
};

// Real Manager API Service - Using your existing Prisma endpoints
export const managerApi = {
  // ====================
  // DASHBOARD DATA
  // ====================
  
  getDashboardStats: async (): Promise<DashboardStats> => {
    const operation = 'getDashboardStats';
    logOperation(`${operation} - Starting`);
    
    try {
      logOperation(`${operation} - Fetching data from multiple endpoints`);
      
      const [
        products,
        users,
        sales,
        inventoryMovements,
        alerts
      ] = await Promise.all([
        managerApi.getProducts(),
        managerApi.getStaff(),
        managerApi.getRecentSales(),
        managerApi.getInventoryMovements({ limit: 100 }),
        managerApi.getAlerts()
      ]);

      logOperation(`${operation} - Data received`, {
        products: products.length,
        users: users.length,
        sales: sales.length,
        inventoryMovements: inventoryMovements.length,
        alerts: alerts.length
      });

      // Calculate pending orders (sales that need processing)
      const recentSales = sales.filter(sale => 
        sale.saleDate >= new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      );
      const pendingOrders = recentSales.length;
      logOperation(`${operation} - Pending orders (last 24h): ${pendingOrders}`);

      // Low stock items based on your lowStockThreshold
      const lowStockItems = products.filter(product => 
        product.currentStock <= product.lowStockThreshold
      ).length;
      logOperation(`${operation} - Low stock items: ${lowStockItems}`);

      // Active staff
      const activeStaff = users.filter(user => user.isActive).length;
      logOperation(`${operation} - Active staff: ${activeStaff}/${users.length}`);

      // Today's shipments (sales today)
      const today = new Date().toDateString();
      const todaySales = sales.filter(sale => 
        new Date(sale.saleDate).toDateString() === today
      );
      const todayShipments = todaySales.length;
      logOperation(`${operation} - Today's shipments: ${todayShipments}`);

      // Total sales value
      const totalSalesAmount = sales.reduce((sum, sale) => sum + sale.totalSaleAmount, 0);
      logOperation(`${operation} - Total sales value: $${totalSalesAmount.toFixed(2)}`);

      // Total inventory value
      const totalInventoryValue = products.reduce((sum, product) => 
        sum + (product.currentStock * product.unitPrice), 0
      );
      logOperation(`${operation} - Total inventory value: $${totalInventoryValue.toFixed(2)}`);

      // Warehouse utilization (assuming 100k max capacity)
      const warehouseUtilization = Math.min((totalInventoryValue / 100000) * 100, 100);
      logOperation(`${operation} - Warehouse utilization: ${warehouseUtilization.toFixed(1)}%`);

      const stats = {
        pendingOrders,
        lowStockItems,
        activeStaff,
        totalStaff: users.length,
        pendingTasks: alerts.filter(alert => !alert.isResolved).length,
        todayShipments,
        warehouseUtilization,
        orderAccuracy: 98.5, // Hardcoded for now
        totalSales: totalSalesAmount,
        totalInventoryValue
      };

      logOperation(`${operation} - Completed successfully`, stats);
      return stats;
    } catch (error) {
      logError(operation, error);
      throw error;
    }
  },

  // ====================
  // TEAM MANAGEMENT
  // ====================
  
  getTeamMembers: async (): Promise<StaffMember[]> => {
    const operation = 'getTeamMembers';
    logOperation(`${operation} - Fetching team members`);
    
    try {
      const staff = await managerApi.getStaff();
      const teamMembers: StaffMember[] = staff.map(user => ({
        ...user,
        department: user.role === 'MANAGER' ? 'Management' : 'Operations',
        position: user.role === 'MANAGER' ? 'Manager' : 'Staff Member'
      }));
      
      logOperation(`${operation} - Retrieved ${teamMembers.length} team members`);
      return teamMembers;
    } catch (error) {
      logError(operation, error);
      throw error;
    }
  },

  // ====================
  // WAREHOUSE MANAGEMENT
  // ====================
  
  getWarehouseStatus: async (): Promise<WarehouseStatus> => {
    const operation = 'getWarehouseStatus';
    logOperation(`${operation} - Getting warehouse status`);
    
    try {
      const products = await managerApi.getProducts();
      const totalValue = products.reduce((sum, product) => 
        sum + (product.currentStock * product.unitPrice), 0
      );
      
      const status: WarehouseStatus = {
        utilization: Math.min((totalValue / 100000) * 100, 100),
        totalValue,
        productCount: products.length,
        lowStockCount: products.filter(p => p.currentStock <= p.lowStockThreshold).length,
        overStockCount: products.filter(p => p.currentStock >= p.overStockLimit).length
      };
      
      logOperation(`${operation} - Warehouse status calculated`, status);
      return status;
    } catch (error) {
      logError(operation, error);
      throw error;
    }
  },

  getWarehouseLocations: async (): Promise<WarehouseLocation[]> => {
    const operation = 'getWarehouseLocations';
    logOperation(`${operation} - Getting warehouse locations`);
    
    try {
      // Mock data - you can replace this with real API call
      const locations: WarehouseLocation[] = [
        { id: 1, name: 'Aisle 1', capacity: 1000, used: 750 },
        { id: 2, name: 'Aisle 2', capacity: 800, used: 600 },
        { id: 3, name: 'Aisle 3', capacity: 1200, used: 900 },
        { id: 4, name: 'Cold Storage', capacity: 500, used: 300 },
      ];
      
      logOperation(`${operation} - Retrieved ${locations.length} locations`);
      return locations;
    } catch (error) {
      logError(operation, error);
      throw error;
    }
  },

  // ====================
  // PRODUCT MANAGEMENT
  // ====================
  
  getProducts: async (): Promise<Product[]> => {
    const operation = 'getProducts';
    logOperation(`${operation} - Fetching all products`);
    
    try {
      const response = await apiFetch<{ success: boolean; data: Product[] }>('/api/products');
      const products = response.data || [];
      logOperation(`${operation} - Retrieved ${products.length} products`);
      return products;
    } catch (error) {
      logError(operation, error);
      throw error;
    }
  },

  getLowStockItems: async (): Promise<Product[]> => {
    const operation = 'getLowStockItems';
    logOperation(`${operation} - Calculating low stock items`);
    
    try {
      const products = await managerApi.getProducts();
      const lowStockItems = products.filter(product => 
        product.currentStock <= product.lowStockThreshold
      );
      logOperation(`${operation} - Found ${lowStockItems.length} low stock items`);
      return lowStockItems;
    } catch (error) {
      logError(operation, error);
      throw error;
    }
  },

  updateProductStock: async (productId: number, newStock: number, reason?: string): Promise<Product> => {
    const operation = 'updateProductStock';
    logOperation(`${operation} - Starting`, { productId, newStock, reason });
    
    try {
      // First update the product
      logOperation(`${operation} - Updating product ${productId} stock to ${newStock}`);
      const response = await apiFetch<{ success: boolean; data: Product }>(`/api/products/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({ currentStock: newStock }),
      });

      const updatedProduct = response.data;
      logOperation(`${operation} - Product updated successfully`, updatedProduct);

      // Then record the movement
      logOperation(`${operation} - Recording inventory movement`);
      await managerApi.recordInventoryMovement({
        productId,
        type: 'ADJUSTMENT_IN',
        quantity: newStock,
        description: reason || 'Stock adjustment by manager'
      });

      logOperation(`${operation} - Completed successfully for product ${productId}`);
      return updatedProduct;
    } catch (error) {
      logError(operation, error);
      throw error;
    }
  },

  // ====================
  // STAFF MANAGEMENT
  // ====================
  
  getStaff: async (): Promise<User[]> => {
    const operation = 'getStaff';
    logOperation(`${operation} - Fetching staff users`);
    
    try {
      const response = await apiFetch<{ success: boolean; data: User[] }>('/api/users');
      const allUsers = response.data || [];
      
      // Filter for staff and managers (not admins/superadmins)
      const staffUsers = allUsers.filter(user => 
        user.role === 'STAFF' || user.role === 'MANAGER'
      );
      
      logOperation(`${operation} - Retrieved ${staffUsers.length} staff members from ${allUsers.length} total users`);
      return staffUsers;
    } catch (error) {
      logError(operation, error);
      throw error;
    }
  },

  getActiveStaff: async (): Promise<User[]> => {
    const operation = 'getActiveStaff';
    logOperation(`${operation} - Fetching active staff`);
    
    try {
      const staff = await managerApi.getStaff();
      const activeStaff = staff.filter(user => user.isActive);
      logOperation(`${operation} - Found ${activeStaff.length} active staff members`);
      return activeStaff;
    } catch (error) {
      logError(operation, error);
      throw error;
    }
  },

  updateStaffStatus: async (userId: number, isActive: boolean): Promise<User> => {
    const operation = 'updateStaffStatus';
    logOperation(`${operation} - Starting`, { userId, isActive });
    
    try {
      const response = await apiFetch<{ success: boolean; data: User }>(`/api/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
      
      const updatedUser = response.data;
      logOperation(`${operation} - User ${userId} status updated to ${isActive ? 'active' : 'inactive'}`, updatedUser);
      return updatedUser;
    } catch (error) {
      logError(operation, error);
      throw error;
    }
  },

  // ====================
  // SALES & ORDERS
  // ====================
  
  getRecentSales: async (days: number = 7): Promise<Sale[]> => {
    const operation = 'getRecentSales';
    logOperation(`${operation} - Fetching sales from last ${days} days`);
    
    try {
      const response = await apiFetch<{ success: boolean; data: Sale[] }>(
        `/api/sales?days=${days}`
      );
      const sales = response.data || [];
      logOperation(`${operation} - Retrieved ${sales.length} sales`);
      return sales;
    } catch (error) {
      logError(operation, error);
      throw error;
    }
  },

  getTodaySales: async (): Promise<Sale[]> => {
    const operation = 'getTodaySales';
    const today = new Date().toISOString().split('T')[0];
    logOperation(`${operation} - Fetching today's sales (${today})`);
    
    try {
      const response = await apiFetch<{ success: boolean; data: Sale[] }>(
        `/api/sales?date=${today}`
      );
      const sales = response.data || [];
      logOperation(`${operation} - Retrieved ${sales.length} sales for today`);
      return sales;
    } catch (error) {
      logError(operation, error);
      throw error;
    }
  },

  createSale: async (saleData: {
    productId: number;
    quantitySold: number;
    unitPriceSold?: number;
    notes?: string;
  }): Promise<Sale> => {
    const operation = 'createSale';
    logOperation(`${operation} - Creating new sale`, saleData);
    
    try {
      const response = await apiFetch<{ success: boolean; data: Sale }>('/api/sales', {
        method: 'POST',
        body: JSON.stringify(saleData),
      });
      
      const newSale = response.data;
      logOperation(`${operation} - Sale created successfully`, {
        saleId: newSale.id,
        amount: newSale.totalSaleAmount,
        product: newSale.product.name
      });
      return newSale;
    } catch (error) {
      logError(operation, error);
      throw error;
    }
  },

  // ====================
  // INVENTORY MOVEMENTS
  // ====================
  
  getInventoryMovements: async (params?: {
    productId?: number;
    type?: MovementType;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<InventoryMovement[]> => {
    const operation = 'getInventoryMovements';
    logOperation(`${operation} - Fetching with params`, params);
    
    try {
      const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
      const response = await apiFetch<{ success: boolean; data: InventoryMovement[] }>(
        `/api/inventory-movements${query}`
      );
      const movements = response.data || [];
      logOperation(`${operation} - Retrieved ${movements.length} movements`);
      return movements;
    } catch (error) {
      logError(operation, error);
      throw error;
    }
  },

  recordInventoryMovement: async (movementData: {
    productId: number;
    type: MovementType;
    quantity: number;
    costPrice?: number;
    description?: string;
    supplierId?: number;
  }): Promise<InventoryMovement> => {
    const operation = 'recordInventoryMovement';
    logOperation(`${operation} - Recording movement`, movementData);
    
    try {
      const userId = parseInt(localStorage.getItem('userId') || '0');
      const response = await apiFetch<{ success: boolean; data: InventoryMovement }>('/api/inventory-movements', {
        method: 'POST',
        body: JSON.stringify({
          ...movementData,
          userId
        }),
      });
      
      const movement = response.data;
      logOperation(`${operation} - Movement recorded`, {
        movementId: movement.id,
        productId: movement.productId,
        type: movement.type,
        quantity: movement.quantity
      });
      return movement;
    } catch (error) {
      logError(operation, error);
      throw error;
    }
  },

  // ====================
  // STOCK REQUEST METHODS
  // ====================
  
  requestStock: async (requestData: {
    productId: number;
    quantity: number;
    urgency: 'low' | 'medium' | 'high';
    reason: string;
    notes?: string;
  }): Promise<any> => {
    const operation = 'requestStock';
    logOperation(`${operation} - Requesting stock`, requestData);
    
    try {
      // Use the existing createStockRequest method
      const products = await managerApi.getProducts();
      const product = products.find(p => p.id === requestData.productId);
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      const result = await managerApi.createStockRequest({
        productId: requestData.productId,
        productName: product.name,
        quantityRequested: requestData.quantity,
        urgency: requestData.urgency,
        reason: requestData.reason,
        notes: requestData.notes
      });
      
      logOperation(`${operation} - Stock request submitted successfully`);
      return result;
    } catch (error) {
      logError(operation, error);
      throw error;
    }
  },

  // ====================
  // ALERTS & NOTIFICATIONS
  // ====================
  
  getAlerts: async (resolved?: boolean): Promise<Alert[]> => {
    const operation = 'getAlerts';
    logOperation(`${operation} - Fetching alerts`, { resolved });
    
    try {
      const query = resolved !== undefined ? `?resolved=${resolved}` : '';
      const response = await apiFetch<{ success: boolean; data: Alert[] }>(
        `/api/alerts${query}`
      );
      const alerts = response.data || [];
      logOperation(`${operation} - Retrieved ${alerts.length} alerts`);
      return alerts;
    } catch (error) {
      logError(operation, error);
      throw error;
    }
  },

  resolveAlert: async (alertId: number): Promise<Alert> => {
    const operation = 'resolveAlert';
    logOperation(`${operation} - Resolving alert ${alertId}`);
    
    try {
      const response = await apiFetch<{ success: boolean; data: Alert }>(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isResolved: true }),
      });
      
      const resolvedAlert = response.data;
      logOperation(`${operation} - Alert ${alertId} resolved successfully`);
      return resolvedAlert;
    } catch (error) {
      logError(operation, error);
      throw error;
    }
  },

  createAlert: async (alertData: {
    productId: number;
    type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK';
    message: string;
  }): Promise<Alert> => {
    const operation = 'createAlert';
    logOperation(`${operation} - Creating new alert`, alertData);
    
    try {
      const response = await apiFetch<{ success: boolean; data: Alert }>('/api/alerts', {
        method: 'POST',
        body: JSON.stringify(alertData),
      });
      
      const newAlert = response.data;
      logOperation(`${operation} - Alert created`, {
        alertId: newAlert.id,
        type: newAlert.type,
        productId: newAlert.productId
      });
      return newAlert;
    } catch (error) {
      logError(operation, error);
      throw error;
    }
  },

  // ====================
  // STOCK REQUESTS (Custom - need to add to your backend)
  // ====================
  
  createStockRequest: async (requestData: {
    productId: number;
    productName: string;
    quantityRequested: number;
    urgency: 'low' | 'medium' | 'high';
    reason: string;
    notes?: string;
  }): Promise<any> => {
    const operation = 'createStockRequest';
    logOperation(`${operation} - Creating stock request`, requestData);
    
    try {
      const userId = parseInt(localStorage.getItem('userId') || '0');
      logOperation(`${operation} - Attempting to create stock request via API`);
      
      const response = await apiFetch<any>('/api/stock-requests', {
        method: 'POST',
        body: JSON.stringify({
          ...requestData,
          requestedBy: userId,
          status: 'pending'
        }),
      });
      
      logOperation(`${operation} - Stock request created successfully via API`);
      return response;
    } catch (error) {
      logError(operation, error);
      console.warn('Stock requests endpoint not available, creating alert instead');
      
      // Fallback: create an alert for low stock
      logOperation(`${operation} - Falling back to alert creation`);
      return managerApi.createAlert({
        productId: requestData.productId,
        type: 'LOW_STOCK',
        message: `Stock request: ${requestData.productName} - ${requestData.quantityRequested} units (${requestData.urgency} priority)`
      });
    }
  },

  // ====================
  // TASK MANAGEMENT (Custom - need to add to your backend)
  // ====================
  
  getTasks: async (): Promise<ManagerTask[]> => {
    const operation = 'getTasks';
    logOperation(`${operation} - Fetching tasks`);
    
    try {
      logOperation(`${operation} - Attempting to fetch tasks from API`);
      const response = await apiFetch<{ success: boolean; data: ManagerTask[] }>('/api/tasks');
      const tasks = response.data || [];
      logOperation(`${operation} - Retrieved ${tasks.length} tasks from API`);
      return tasks;
    } catch (error) {
      logError(operation, error);
      console.warn('Tasks endpoint not available, using alerts as tasks');
      
      // Fallback: use unresolved alerts as tasks
      logOperation(`${operation} - Falling back to alerts as tasks`);
      const alerts = await managerApi.getAlerts(false);
      
      const taskFallback: ManagerTask[] = alerts.map(alert => ({
        id: alert.id,
        title: `Resolve ${alert.type.toLowerCase().replace('_', ' ')} alert`,
        description: alert.message,
        assignedTo: 0,
        assignedToName: 'Manager',
        priority: (alert.type === 'OUT_OF_STOCK' ? 'high' : 'medium') as 'low' | 'medium' | 'high',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled',
        taskType: 'alert_resolution',
        estimatedHours: 1,
        createdAt: alert.createdAt,
        createdBy: 0
      }));
      
      logOperation(`${operation} - Created ${taskFallback.length} tasks from alerts`);
      return taskFallback;
    }
  },

  createTask: async (taskData: Omit<ManagerTask, 'id' | 'createdAt'>): Promise<ManagerTask> => {
    const operation = 'createTask';
    logOperation(`${operation} - Creating new task`, taskData);
    
    try {
      logOperation(`${operation} - Attempting to create task via API`);
      const response = await apiFetch<{ success: boolean; data: ManagerTask }>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          ...taskData,
          createdAt: new Date().toISOString()
        }),
      });
      
      const newTask = response.data;
      logOperation(`${operation} - Task created successfully via API`, { taskId: newTask.id });
      return newTask;
    } catch (error) {
      logError(operation, error);
      console.warn('Tasks endpoint not available, task not created');
      throw new Error('Task creation not available');
    }
  },

  // ====================
  // REPORTS
  // ====================
  
  getInventoryReport: async (): Promise<{
    products: Product[];
    totalValue: number;
    lowStockCount: number;
    overStockCount: number;
  }> => {
    const operation = 'getInventoryReport';
    logOperation(`${operation} - Generating inventory report`);
    
    try {
      const products = await managerApi.getProducts();
      logOperation(`${operation} - Processing ${products.length} products`);
      
      const totalValue = products.reduce((sum, product) => 
        sum + (product.currentStock * product.unitPrice), 0
      );
      
      const lowStockCount = products.filter(p => p.currentStock <= p.lowStockThreshold).length;
      const overStockCount = products.filter(p => p.currentStock >= p.overStockLimit).length;
      
      const report = {
        products,
        totalValue,
        lowStockCount,
        overStockCount
      };
      
      logOperation(`${operation} - Report generated`, {
        totalValue: `$${totalValue.toFixed(2)}`,
        lowStockCount,
        overStockCount,
        productCount: products.length
      });
      
      return report;
    } catch (error) {
      logError(operation, error);
      throw error;
    }
  },

  getSalesReport: async (startDate?: string, endDate?: string): Promise<{
    sales: Sale[];
    totalRevenue: number;
    totalUnits: number;
    topProducts: Array<{product: Product; quantity: number; revenue: number}>;
  }> => {
    const operation = 'getSalesReport';
    logOperation(`${operation} - Generating sales report`, { startDate, endDate });
    
    try {
      const sales = await managerApi.getRecentSales(30); // Last 30 days
      logOperation(`${operation} - Processing ${sales.length} sales records`);
      
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalSaleAmount, 0);
      const totalUnits = sales.reduce((sum, sale) => sum + sale.quantitySold, 0);
      
      logOperation(`${operation} - Summary`, {
        totalRevenue: `$${totalRevenue.toFixed(2)}`,
        totalUnits
      });
      
      // Group by product
      const productMap = new Map<number, { product: Product; quantity: number; revenue: number }>();
      sales.forEach(sale => {
        const existing = productMap.get(sale.productId);
        if (existing) {
          existing.quantity += sale.quantitySold;
          existing.revenue += sale.totalSaleAmount;
        } else {
          productMap.set(sale.productId, {
            product: sale.product,
            quantity: sale.quantitySold,
            revenue: sale.totalSaleAmount
          });
        }
      });
      
      const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
      
      logOperation(`${operation} - Top ${topProducts.length} products identified`);
      
      const report = {
        sales,
        totalRevenue,
        totalUnits,
        topProducts
      };
      
      return report;
    } catch (error) {
      logError(operation, error);
      throw error;
    }
  }
};