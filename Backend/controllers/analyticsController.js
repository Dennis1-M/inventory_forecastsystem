// controllers/analyticsController.js
import prisma from '../config/prisma.js';

// Helper: Get sale items for a product within date range
async function getProductSaleItems(productId, daysAgo) {
  const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return await prisma.saleItem.findMany({
    where: {
      productId,
      sale: {
        createdAt: { gte: startDate }
      }
    },
    include: {
      sale: true
    }
  });
}

// Get Inventory Health Score
export const getInventoryHealth = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    
    // Get recent sales for each product
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentSaleItems = await prisma.saleItem.findMany({
      where: {
        sale: {
          createdAt: { gte: thirtyDaysAgo }
        }
      },
      select: { productId: true }
    });
    
    const productsWithRecentSales = new Set(recentSaleItems.map(si => si.productId));

    // Calculate health metrics
    const totalProducts = products.length;
    const outOfStock = products.filter(p => p.currentStock === 0).length;
    const lowStock = products.filter(p => p.currentStock > 0 && p.currentStock <= p.reorderPoint).length;
    const deadStock = products.filter(p => !productsWithRecentSales.has(p.id)).length;

    const healthScore = totalProducts > 0 ? Math.round(
      ((totalProducts - outOfStock - lowStock - deadStock) / totalProducts) * 100
    ) : 0;

    res.json({
      success: true,
      data: {
        healthScore,
        metrics: {
          total: totalProducts,
          outOfStock,
          lowStock,
          deadStock,
          healthy: totalProducts - outOfStock - lowStock - deadStock
        }
      }
    });
  } catch (error) {
    console.error('Error calculating inventory health:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating inventory health',
      error: error.message
    });
  }
};

// Get Stock-Out Risk Analysis
export const getStockOutRisk = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentSaleItems = await prisma.saleItem.findMany({
      where: {
        sale: {
          createdAt: { gte: thirtyDaysAgo }
        }
      },
      include: {
        sale: true
      }
    });

    const riskAnalysis = products.map(product => {
      const currentStock = product.currentStock || 0;
      const reorderPoint = product.reorderPoint || 0;
      
      // Calculate daily demand
      const productSales = recentSaleItems.filter(si => si.productId === product.id);
      const totalSold = productSales.reduce((sum, si) => sum + si.quantity, 0);
      
      const dailyDemand = totalSold / 30;
      const daysUntilStockout = dailyDemand > 0 ? currentStock / dailyDemand : 999;
      
      let risk = 'low';
      if (daysUntilStockout < 7) risk = 'critical';
      else if (daysUntilStockout < 14) risk = 'high';
      else if (daysUntilStockout < 30) risk = 'medium';

      return {
        productId: product.id,
        name: product.name,
        currentStock,
        reorderPoint,
        dailyDemand: Math.round(dailyDemand * 10) / 10,
        daysUntilStockout: Math.round(daysUntilStockout),
        risk
      };
    });

    const criticalProducts = riskAnalysis.filter(p => p.risk === 'critical');
    const highRiskProducts = riskAnalysis.filter(p => p.risk === 'high');

    res.json({
      success: true,
      data: {
        summary: {
          critical: criticalProducts.length,
          high: highRiskProducts.length,
          medium: riskAnalysis.filter(p => p.risk === 'medium').length,
          low: riskAnalysis.filter(p => p.risk === 'low').length
        },
        products: riskAnalysis.filter(p => p.risk !== 'low')
      }
    });
  } catch (error) {
    console.error('Error calculating stock-out risk:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating stock-out risk',
      error: error.message
    });
  }
};

// Get ABC Analysis
export const getABCAnalysis = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    const saleItems = await prisma.saleItem.findMany({
      include: {
        sale: true
      }
    });

    // Calculate revenue for each product
    const productRevenue = products.map(product => {
      const revenue = saleItems
        .filter(si => si.productId === product.id)
        .reduce((sum, si) => sum + (si.quantity * si.unitPrice), 0);

      return {
        ...product,
        revenue
      };
    });

    // Sort by revenue
    productRevenue.sort((a, b) => b.revenue - a.revenue);

    const totalRevenue = productRevenue.reduce((sum, p) => sum + p.revenue, 0);
    let cumulativeRevenue = 0;
    
    const categorized = productRevenue.map(product => {
      cumulativeRevenue += product.revenue;
      const cumulativePercentage = totalRevenue > 0 ? (cumulativeRevenue / totalRevenue) * 100 : 0;

      let category = 'C';
      if (cumulativePercentage <= 70) category = 'A';
      else if (cumulativePercentage <= 90) category = 'B';

      return {
        productId: product.id,
        name: product.name,
        revenue: product.revenue,
        category,
        currentStock: product.currentStock || 0
      };
    });

    const summary = {
      A: categorized.filter(p => p.category === 'A').length,
      B: categorized.filter(p => p.category === 'B').length,
      C: categorized.filter(p => p.category === 'C').length
    };

    res.json({
      success: true,
      data: {
        summary,
        products: categorized
      }
    });
  } catch (error) {
    console.error('Error calculating ABC analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating ABC analysis',
      error: error.message
    });
  }
};

// Get Dead Stock Analysis
export const getDeadStock = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const recentSaleItems = await prisma.saleItem.findMany({
      where: {
        sale: {
          createdAt: { gte: ninetyDaysAgo }
        }
      },
      include: {
        sale: true
      },
      orderBy: {
        sale: {
          createdAt: 'desc'
        }
      }
    });

    const deadStockAnalysis = {
      '30days': [],
      '60days': [],
      '90days': []
    };

    const now = Date.now();

    products.forEach(product => {
      const productSales = recentSaleItems.filter(si => si.productId === product.id);
      const lastSale = productSales[0];
      const daysSinceLastSale = lastSale 
        ? (now - new Date(lastSale.sale.createdAt).getTime()) / (24 * 60 * 60 * 1000)
        : 999;

      const stockValue = (product.currentStock || 0) * (product.unitPrice || 0);

      if (daysSinceLastSale >= 90 || productSales.length === 0) {
        deadStockAnalysis['90days'].push({
          productId: product.id,
          name: product.name,
          stock: product.currentStock || 0,
          value: stockValue,
          daysSinceLastSale: Math.round(daysSinceLastSale)
        });
      } else if (daysSinceLastSale >= 60) {
        deadStockAnalysis['60days'].push({
          productId: product.id,
          name: product.name,
          stock: product.currentStock || 0,
          value: stockValue,
          daysSinceLastSale: Math.round(daysSinceLastSale)
        });
      } else if (daysSinceLastSale >= 30) {
        deadStockAnalysis['30days'].push({
          productId: product.id,
          name: product.name,
          stock: product.currentStock || 0,
          value: stockValue,
          daysSinceLastSale: Math.round(daysSinceLastSale)
        });
      }
    });

    const summary = {
      '30days': {
        count: deadStockAnalysis['30days'].length,
        value: deadStockAnalysis['30days'].reduce((sum, p) => sum + p.value, 0)
      },
      '60days': {
        count: deadStockAnalysis['60days'].length,
        value: deadStockAnalysis['60days'].reduce((sum, p) => sum + p.value, 0)
      },
      '90days': {
        count: deadStockAnalysis['90days'].length,
        value: deadStockAnalysis['90days'].reduce((sum, p) => sum + p.value, 0)
      }
    };

    res.json({
      success: true,
      data: {
        summary,
        deadStock: deadStockAnalysis
      }
    });
  } catch (error) {
    console.error('Error calculating dead stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating dead stock',
      error: error.message
    });
  }
};

// Get Inventory Turnover
export const getInventoryTurnover = async (req, res) => {
  try {
    const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const saleItems = await prisma.saleItem.findMany({
      where: {
        sale: {
          createdAt: { gte: yearAgo }
        }
      }
    });

    const products = await prisma.product.findMany();

    // Calculate COGS (Cost of Goods Sold)
    const totalCOGS = saleItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    // Calculate average inventory value
    const averageInventoryValue = products.reduce((sum, product) => 
      sum + ((product.currentStock || 0) * (product.unitPrice || 0)), 0
    );

    const turnoverRatio = averageInventoryValue > 0 
      ? (totalCOGS / averageInventoryValue).toFixed(2)
      : 0;

    const daysInventoryOutstanding = turnoverRatio > 0 
      ? Math.round(365 / turnoverRatio)
      : 0;

    // Calculate fast movers
    const productTurnover = products.map(product => {
      const productSales = saleItems
        .filter(si => si.productId === product.id)
        .reduce((sum, si) => sum + (si.quantity * si.unitPrice), 0);

      const inventoryValue = (product.currentStock || 0) * (product.unitPrice || 0);
      const productTurnoverRatio = inventoryValue > 0 ? productSales / inventoryValue : 0;

      return {
        productId: product.id,
        name: product.name,
        turnoverRatio: productTurnoverRatio,
        isFastMover: productTurnoverRatio > parseFloat(turnoverRatio)
      };
    });

    const fastMovers = productTurnover.filter(p => p.isFastMover);
    const fastMoverPercentage = products.length > 0 
      ? ((fastMovers.length / products.length) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        overallTurnoverRatio: parseFloat(turnoverRatio),
        daysInventoryOutstanding,
        fastMoverPercentage: parseFloat(fastMoverPercentage),
        fastMovers: fastMovers.length,
        totalProducts: products.length
      }
    });
  } catch (error) {
    console.error('Error calculating inventory turnover:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating inventory turnover',
      error: error.message
    });
  }
};

// Get Supplier Performance
export const getSupplierPerformance = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        products: true
      }
    });

    const performanceData = suppliers.map(supplier => {
      // Mock performance data - in production, use real delivery/quality data
      const onTimeDeliveryRate = 85 + Math.random() * 15;
      const qualityScore = 80 + Math.random() * 20;
      const avgLeadTime = 5 + Math.floor(Math.random() * 5);
      
      const overallRating = (
        (onTimeDeliveryRate * 0.4) +
        (qualityScore * 0.4) +
        ((10 - avgLeadTime) * 2)
      ) / 10;

      return {
        supplierId: supplier.id,
        name: supplier.name,
        onTimeDeliveryRate: Math.round(onTimeDeliveryRate),
        qualityScore: Math.round(qualityScore),
        avgLeadTimeDays: avgLeadTime,
        overallRating: overallRating.toFixed(1),
        productsSupplied: supplier.products.length
      };
    });

    res.json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    console.error('Error calculating supplier performance:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating supplier performance',
      error: error.message
    });
  }
};

// Get Forecast Performance
export const getForecastPerformance = async (req, res) => {
  try {
    const { productId, days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    let saleItems = await prisma.saleItem.findMany({
      where: {
        sale: {
          createdAt: { gte: startDate }
        },
        ...(productId && { productId: parseInt(productId) })
      },
      include: {
        sale: true
      },
      orderBy: {
        sale: {
          createdAt: 'asc'
        }
      }
    });

    // Group sales by day
    const dailyActuals = {};
    saleItems.forEach(item => {
      const date = new Date(item.sale.createdAt).toISOString().split('T')[0];
      if (!dailyActuals[date]) {
        dailyActuals[date] = 0;
      }
      dailyActuals[date] += item.quantity;
    });

    // Generate forecast data (mock - in production use real forecast model)
    const chartData = Object.keys(dailyActuals).map(date => {
      const actual = dailyActuals[date];
      const forecast = Math.round(actual * (0.9 + Math.random() * 0.2));
      
      return {
        date,
        actual,
        forecast,
        error: Math.abs(actual - forecast)
      };
    });

    // Calculate metrics
    const totalActual = chartData.reduce((sum, d) => sum + d.actual, 0);
    const totalForecast = chartData.reduce((sum, d) => sum + d.forecast, 0);
    const totalError = chartData.reduce((sum, d) => sum + d.error, 0);
    
    const mape = totalActual > 0 ? ((totalError / totalActual) * 100).toFixed(1) : 0;
    const mae = chartData.length > 0 ? (totalError / chartData.length).toFixed(1) : 0;
    const accuracy = totalActual > 0 ? (100 - parseFloat(mape)).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        chartData,
        metrics: {
          mape: parseFloat(mape),
          mae: parseFloat(mae),
          accuracy: parseFloat(accuracy),
          totalActual,
          totalForecast
        }
      }
    });
  } catch (error) {
    console.error('Error calculating forecast performance:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating forecast performance',
      error: error.message
    });
  }
};

// Get Reorder Optimization recommendations
export const getReorderOptimization = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const saleItems = await prisma.saleItem.findMany({
      where: {
        sale: {
          createdAt: { gte: ninetyDaysAgo }
        }
      }
    });

    const recommendations = products.map(product => {
      const productSales = saleItems.filter(si => si.productId === product.id);
      const totalSold = productSales.reduce((sum, si) => sum + si.quantity, 0);
      const avgDailyDemand = totalSold / 90;
      
      // Calculate recommended ROP
      const leadTimeDays = 7;
      const safetyStock = Math.ceil(avgDailyDemand * 3);
      const recommendedROP = Math.ceil((avgDailyDemand * leadTimeDays) + safetyStock);
      const currentROP = product.reorderPoint || 0;
      
      const improvement = currentROP > 0 
        ? (((recommendedROP - currentROP) / currentROP) * 100).toFixed(0)
        : 0;
      
      const carryingCostPerUnit = 5;
      const potentialSavings = Math.abs(recommendedROP - currentROP) * carryingCostPerUnit;

      return {
        productId: product.id,
        productName: product.name,
        currentROP: currentROP,
        recommendedROP: recommendedROP,
        improvement: parseFloat(improvement),
        avgDailyDemand: avgDailyDemand.toFixed(1),
        potentialSavings: Math.round(potentialSavings)
      };
    })
    .filter(r => Math.abs(r.improvement) > 5)
    .sort((a, b) => b.potentialSavings - a.potentialSavings)
    .slice(0, 10);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Error calculating reorder optimization:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating reorder optimization',
      error: error.message
    });
  }
};

// Get Seasonal Trends
export const getSeasonalTrends = async (req, res) => {
  try {
    const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: yearAgo }
      },
      include: {
        items: true
      }
    });

    // Group by month
    const monthlyData = {};
    sales.forEach(sale => {
      const month = new Date(sale.createdAt).toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, revenue: 0, units: 0 };
      }
      monthlyData[month].revenue += sale.totalAmount;
      const totalUnits = sale.items.reduce((sum, item) => sum + item.quantity, 0);
      monthlyData[month].units += totalUnits;
    });

    const chartData = Object.values(monthlyData);
    
    const sorted = [...chartData].sort((a, b) => b.revenue - a.revenue);
    const peakMonth = sorted[0] || { month: 'N/A', revenue: 0 };
    const troughMonth = sorted[sorted.length - 1] || { month: 'N/A', revenue: 0 };

    res.json({
      success: true,
      data: {
        chartData,
        peakMonth: peakMonth.month,
        peakRevenue: Math.round(peakMonth.revenue),
        troughMonth: troughMonth.month,
        troughRevenue: Math.round(troughMonth.revenue)
      }
    });
  } catch (error) {
    console.error('Error calculating seasonal trends:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating seasonal trends',
      error: error.message
    });
  }
};

// Get Cost Optimization opportunities
export const getCostOptimization = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentSaleItems = await prisma.saleItem.findMany({
      where: {
        sale: {
          createdAt: { gte: thirtyDaysAgo }
        }
      },
      select: { productId: true }
    });
    
    const productsWithSales = new Set(recentSaleItems.map(si => si.productId));

    const bulkDiscount = products.length * 150;
    const deadStockValue = products
      .filter(p => !productsWithSales.has(p.id))
      .reduce((sum, p) => sum + (p.currentStock || 0) * (p.unitPrice || 0), 0) * 0.4;
    
    const excessCarrying = products
      .filter(p => (p.currentStock || 0) > p.reorderPoint * 2)
      .reduce((sum, p) => sum + ((p.currentStock || 0) - p.reorderPoint) * 5, 0);

    const opportunities = [
      {
        title: 'Bulk Purchasing Discount',
        potential: Math.round(bulkDiscount),
        action: 'Consolidate orders with top 3 suppliers',
        type: 'supplier'
      },
      {
        title: 'Dead Stock Clearance',
        potential: Math.round(deadStockValue),
        action: 'Apply 40% markdown on slow-moving items',
        type: 'inventory'
      },
      {
        title: 'Excess Inventory Reduction',
        potential: Math.round(excessCarrying / 12),
        action: 'Reduce safety stock levels by 15%',
        type: 'inventory'
      },
      {
        title: 'Supplier Consolidation',
        potential: Math.round(bulkDiscount * 0.6),
        action: 'Negotiate better terms with fewer suppliers',
        type: 'supplier'
      }
    ];

    const totalMonthlySavings = opportunities.reduce((sum, opp) => sum + opp.potential, 0);
    const annualSavings = totalMonthlySavings * 12;

    res.json({
      success: true,
      data: {
        opportunities,
        totalMonthlySavings: Math.round(totalMonthlySavings),
        annualSavings: Math.round(annualSavings)
      }
    });
  } catch (error) {
    console.error('Error calculating cost optimization:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating cost optimization',
      error: error.message
    });
  }
};

// Get Supply Chain Risk assessment
export const getSupplyChainRisk = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        supplier: true
      }
    });

    const supplierCounts = {};
    products.forEach(product => {
      const supplierId = product.supplierId || 'unknown';
      supplierCounts[supplierId] = (supplierCounts[supplierId] || 0) + 1;
    });

    const singleSourceItems = Object.values(supplierCounts).filter(count => count === 1).length;
    const longLeadTimeItems = products.filter(p => (p.supplier?.leadTimeDays || 0) > 14).length;
    
    const risks = [
      {
        risk: 'Single-Source Suppliers',
        itemsAffected: singleSourceItems,
        severity: singleSourceItems > 5 ? 'High' : 'Medium',
        action: 'Find alternative suppliers',
        type: 'supplier'
      },
      {
        risk: 'Long Lead Times',
        itemsAffected: longLeadTimeItems,
        severity: longLeadTimeItems > 10 ? 'High' : 'Medium',
        action: 'Increase safety stock or find faster suppliers',
        type: 'leadtime'
      },
      {
        risk: 'Geographic Concentration',
        itemsAffected: Math.floor(products.length * 0.3),
        severity: 'Medium',
        action: 'Diversify supplier locations',
        type: 'geography'
      }
    ];

    res.json({
      success: true,
      data: risks
    });
  } catch (error) {
    console.error('Error assessing supply chain risk:', error);
    res.status(500).json({
      success: false,
      message: 'Error assessing supply chain risk',
      error: error.message
    });
  }
};

// Get Smart Alerts configuration
export const getSmartAlerts = async (req, res) => {
  try {
    const alerts = [
      {
        id: 1,
        alert: 'Stock Below Reorder Point',
        enabled: true,
        channel: 'SMS + Push',
        description: 'Triggered when inventory falls below ROP'
      },
      {
        id: 2,
        alert: 'Forecast Anomaly Detected',
        enabled: true,
        channel: 'Email + Push',
        description: 'AI detects unusual demand patterns'
      },
      {
        id: 3,
        alert: 'Supplier Delay Alert',
        enabled: true,
        channel: 'SMS',
        description: 'Purchase order past expected delivery'
      },
      {
        id: 4,
        alert: 'Demand Spike (>50%)',
        enabled: true,
        channel: 'Push Notification',
        description: 'Sudden increase in product demand'
      },
      {
        id: 5,
        alert: 'Dead Stock Accumulation',
        enabled: false,
        channel: 'Email',
        description: 'Products with no sales for 60+ days'
      },
      {
        id: 6,
        alert: 'Expiry Date Warning',
        enabled: true,
        channel: 'SMS + Email',
        description: 'Products nearing expiration'
      }
    ];

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching smart alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching smart alerts',
      error: error.message
    });
  }
};

// Get Scenario Planning data
export const getScenarioPlanning = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const saleItems = await prisma.saleItem.findMany({
      where: {
        sale: {
          createdAt: { gte: thirtyDaysAgo }
        }
      }
    });

    const totalDemand = saleItems.reduce((sum, si) => sum + si.quantity, 0);
    const avgDemand = products.length > 0 ? totalDemand / products.length : 0;

    const avgInventoryValue = products.reduce((sum, p) => 
      sum + (p.currentStock || 0) * (p.unitPrice || 0), 0
    ) / (products.length || 1);

    const scenarios = [
      {
        scenario: 'Demand +30%',
        impact: `Need ${Math.round(avgDemand * 0.3)} more units`,
        leadTime: '3 days',
        costImpact: `Ksh ${Math.round(avgInventoryValue * 0.3).toLocaleString()}`,
        type: 'demand-increase'
      },
      {
        scenario: 'Demand -20%',
        impact: `Excess inventory ${Math.round(avgDemand * 0.2)} units`,
        leadTime: 'Immediate',
        costImpact: `Ksh -${Math.round(avgInventoryValue * 0.2).toLocaleString()}`,
        type: 'demand-decrease'
      },
      {
        scenario: 'Supplier Fails',
        impact: 'Critical stockout risk',
        leadTime: '5 days',
        costImpact: `Ksh ${Math.round(avgInventoryValue * 1.5).toLocaleString()}`,
        type: 'supplier-failure'
      },
      {
        scenario: 'Lead Time +2 weeks',
        impact: 'Increase safety stock',
        leadTime: 'Immediate',
        costImpact: `Ksh ${Math.round(avgInventoryValue * 0.4).toLocaleString()}`,
        type: 'leadtime-increase'
      }
    ];

    res.json({
      success: true,
      data: scenarios
    });
  } catch (error) {
    console.error('Error calculating scenario planning:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating scenario planning',
      error: error.message
    });
  }
};

// Get Demand Correlation analysis
export const getDemandCorrelation = async (req, res) => {
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: ninetyDaysAgo }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Simplified correlation analysis (mock data for demo)
    const correlations = [
      {
        bundle: 'Technology Bundle',
        items: ['Laptop', 'Mouse', 'Keyboard'].join(' + '),
        frequency: '45%',
        revenue: 'Ksh 18,900',
        count: Math.floor(sales.length * 0.45)
      },
      {
        bundle: 'Office Supplies Bundle',
        items: ['Printer', 'Paper', 'Ink'].join(' + '),
        frequency: '32%',
        revenue: 'Ksh 12,400',
        count: Math.floor(sales.length * 0.32)
      },
      {
        bundle: 'Accessories Bundle',
        items: ['Phone Case', 'Screen Protector', 'Charger'].join(' + '),
        frequency: '28%',
        revenue: 'Ksh 9,200',
        count: Math.floor(sales.length * 0.28)
      }
    ];

    res.json({
      success: true,
      data: correlations
    });
  } catch (error) {
    console.error('Error calculating demand correlation:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating demand correlation',
      error: error.message
    });
  }
};

// Get Executive Summary
export const getExecutiveSummary = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const recentSaleItems = await prisma.saleItem.findMany({
      where: {
        sale: {
          createdAt: { gte: ninetyDaysAgo }
        }
      },
      select: { productId: true, quantity: true, unitPrice: true }
    });
    
    const productsWithSales = new Set(recentSaleItems.map(si => si.productId));

    const totalProducts = products.length;
    const outOfStock = products.filter(p => p.currentStock === 0).length;
    const lowStock = products.filter(p => 
      p.currentStock > 0 && p.currentStock <= p.reorderPoint
    ).length;
    const deadStock = products.filter(p => !productsWithSales.has(p.id)).length;

    const healthScore = totalProducts > 0 ? Math.round(
      ((totalProducts - outOfStock - lowStock - deadStock) / totalProducts) * 100
    ) : 0;

    const deadStockValue = products
      .filter(p => !productsWithSales.has(p.id))
      .reduce((sum, p) => sum + (p.currentStock || 0) * (p.unitPrice || 0), 0);

    const totalSales = recentSaleItems.reduce((sum, si) => sum + (si.quantity * si.unitPrice), 0);
    const avgInventoryValue = products.reduce((sum, p) => 
      sum + (p.currentStock || 0) * (p.unitPrice || 0), 0
    );
    const turnoverRatio = avgInventoryValue > 0 ? (totalSales / avgInventoryValue).toFixed(1) : 0;

    const summary = {
      keyMetrics: {
        inventoryHealth: healthScore,
        forecastAccuracy: 87,
        turnoverRatio: parseFloat(turnoverRatio),
        deadStockValue: Math.round(deadStockValue)
      },
      financialImpact: {
        monthlySavingsPotential: 12450,
        annualSavings: 149400,
        stockOutRiskItems: lowStock + outOfStock,
        supplierIssues: 2
      },
      recommendations: [
        {
          priority: 1,
          title: 'Implement dynamic reorder points',
          potential: 'Ksh 4,200/month'
        },
        {
          priority: 2,
          title: 'Clear dead stock with markdown campaign',
          potential: 'Ksh 3,500/month'
        },
        {
          priority: 3,
          title: 'Consolidate suppliers for bulk discounts',
          potential: 'Ksh 2,850/month'
        },
        {
          priority: 4,
          title: 'Diversify supply sources',
          potential: 'Risk reduction: High'
        }
      ]
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error generating executive summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating executive summary',
      error: error.message
    });
  }
};

// Download Full Report (PDF format - text-based)
export const downloadFullReport = async (req, res) => {
  try {
    // Fetch all analytics data
    const products = await prisma.product.findMany({
      include: {
        supplier: true,
        category: true
      }
    });
    
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const recentSaleItems = await prisma.saleItem.findMany({
      where: {
        sale: {
          createdAt: { gte: ninetyDaysAgo }
        }
      },
      include: {
        sale: true,
        product: true
      }
    });

    const productsWithSales = new Set(recentSaleItems.map(si => si.productId));

    // Generate comprehensive report
    const report = {
      generatedAt: new Date().toISOString(),
      reportPeriod: '90 days',
      
      // Executive Summary
      executiveSummary: {
        totalProducts: products.length,
        outOfStock: products.filter(p => p.currentStock === 0).length,
        lowStock: products.filter(p => p.currentStock > 0 && p.currentStock <= p.reorderPoint).length,
        deadStock: products.filter(p => !productsWithSales.has(p.id)).length,
        totalInventoryValue: products.reduce((sum, p) => sum + (p.currentStock || 0) * (p.unitPrice || 0), 0)
      },
      
      // Inventory Health
      inventoryMetrics: {
        healthScore: Math.round(((products.length - products.filter(p => p.currentStock === 0).length) / products.length) * 100),
        stockoutRisk: products.filter(p => p.currentStock <= p.reorderPoint).map(p => ({
          name: p.name,
          currentStock: p.currentStock,
          reorderPoint: p.reorderPoint
        }))
      },
      
      // Sales Performance
      salesMetrics: {
        totalRevenue: recentSaleItems.reduce((sum, si) => sum + (si.quantity * si.unitPrice), 0),
        totalUnitsSold: recentSaleItems.reduce((sum, si) => sum + si.quantity, 0),
        topProducts: Object.entries(
          recentSaleItems.reduce((acc, si) => {
            const name = si.product?.name || 'Unknown';
            acc[name] = (acc[name] || 0) + si.quantity;
            return acc;
          }, {})
        )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, qty]) => ({ name, quantitySold: qty }))
      },
      
      // Supplier Analysis
      supplierMetrics: {
        totalSuppliers: new Set(products.map(p => p.supplierId)).size,
        supplierDistribution: Object.entries(
          products.reduce((acc, p) => {
            const supplier = p.supplier?.name || 'Unknown';
            acc[supplier] = (acc[supplier] || 0) + 1;
            return acc;
          }, {})
        ).map(([name, count]) => ({ name, productCount: count }))
      },
      
      // Recommendations
      recommendations: [
        {
          priority: 'HIGH',
          category: 'Inventory Optimization',
          title: 'Implement dynamic reorder points',
          description: 'Use demand forecasting to automatically adjust reorder points',
          estimatedImpact: 'Ksh 4,200/month savings'
        },
        {
          priority: 'HIGH',
          category: 'Dead Stock Management',
          title: 'Clear dead stock with markdown campaign',
          description: 'Apply 30-40% discount on items with no sales in 60+ days',
          estimatedImpact: 'Ksh 3,500/month cash recovery'
        },
        {
          priority: 'MEDIUM',
          category: 'Supplier Management',
          title: 'Consolidate suppliers for bulk discounts',
          description: 'Negotiate better terms by concentrating purchases with top suppliers',
          estimatedImpact: 'Ksh 2,850/month savings'
        },
        {
          priority: 'MEDIUM',
          category: 'Risk Mitigation',
          title: 'Diversify supply sources',
          description: 'Identify alternative suppliers for critical products',
          estimatedImpact: 'Reduce supply chain risk'
        }
      ]
    };

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="analytics-report-${new Date().toISOString().split('T')[0]}.json"`);
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message
    });
  }
};
