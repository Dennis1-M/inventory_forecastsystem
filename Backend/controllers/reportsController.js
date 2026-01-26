// Backend/controllers/reportsController.js
// Controller for exporting various reports in different formats

import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

const prisma = new PrismaClient();

// Helper to format Excel worksheets
const formatExcelWorksheet = (worksheet, headerRow) => {
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  
  worksheet.columns.forEach(column => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, cell => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = maxLength < 10 ? 10 : maxLength + 2;
  });

  worksheet.eachRow({ includeEmpty: false }, row => {
    row.eachCell({ includeEmpty: false }, cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });
};

// Helper to generate PDF header
const addPDFHeader = (doc, title, user) => {
  doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica')
    .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
    .text(`By: ${user?.email || 'System'}`, { align: 'center' });
  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);
};

/**
 * POST /api/reports/manager-export
 * Export manager reports in various formats
 */
export const exportManagerReport = async (req, res) => {
  try {
    const { type = 'sales', format = 'json' } = req.body;
    const userId = req.user?.id;

    // Get user info for audit
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    // Verify user is manager or admin
    if (!['MANAGER', 'ADMIN', 'SUPERADMIN'].includes(user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only managers and admins can export reports',
      });
    }

    let data = {};
    let reportTitle = '';

    switch (type) {
      case 'sales':
        data = await getSalesReport();
        reportTitle = 'Sales Report';
        break;
      case 'inventory':
        data = await getInventoryReport();
        reportTitle = 'Inventory Movement Report';
        break;
      case 'staff-performance':
        data = await getStaffPerformanceReport();
        reportTitle = 'Staff Performance Report';
        break;
      case 'alerts':
        data = await getAlertsReport();
        reportTitle = 'Alerts Report';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type',
        });
    }

    // Log the export activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'EXPORT',
        description: `Exported ${type} report in ${format} format`,
        status: 'success',
        timestamp: new Date(),
      },
    });

    // Excel format
    if (format === 'excel' || format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(reportTitle);

      if (type === 'sales') {
        worksheet.columns = [
          { header: 'Date', key: 'date', width: 20 },
          { header: 'Product', key: 'product', width: 30 },
          { header: 'Quantity', key: 'quantity', width: 12 },
          { header: 'Amount', key: 'amount', width: 15 },
          { header: 'Payment Method', key: 'paymentMethod', width: 15 },
          { header: 'Staff', key: 'staff', width: 20 },
        ];
        
        data.sales.forEach(sale => {
          sale.items.forEach(item => {
            worksheet.addRow({
              date: new Date(sale.date).toLocaleString(),
              product: item.product,
              quantity: item.quantity,
              amount: item.amount,
              paymentMethod: sale.paymentMethod,
              staff: sale.staff,
            });
          });
        });

        worksheet.addRow({});
        worksheet.addRow({ date: 'TOTAL SALES:', amount: data.totalSales });
        worksheet.addRow({ date: 'TOTAL REVENUE:', amount: `KES ${data.totalRevenue.toFixed(2)}` });
      } else if (type === 'inventory') {
        worksheet.columns = [
          { header: 'Date', key: 'date', width: 20 },
          { header: 'Product', key: 'product', width: 30 },
          { header: 'Type', key: 'type', width: 15 },
          { header: 'Quantity', key: 'quantity', width: 12 },
          { header: 'Description', key: 'description', width: 35 },
          { header: 'User', key: 'user', width: 20 },
        ];
        
        data.movements.forEach(movement => {
          worksheet.addRow({
            date: new Date(movement.date).toLocaleString(),
            product: movement.product,
            type: movement.type,
            quantity: movement.quantity,
            description: movement.description,
            user: movement.user,
          });
        });
      } else if (type === 'staff-performance') {
        worksheet.columns = [
          { header: 'Staff Name', key: 'staff', width: 30 },
          { header: 'Sales Count', key: 'salesCount', width: 15 },
          { header: 'Total Revenue', key: 'totalRevenue', width: 20 },
        ];
        
        data.performance.forEach(perf => {
          worksheet.addRow({
            staff: perf.staff,
            salesCount: perf.salesCount,
            totalRevenue: `KES ${perf.totalRevenue.toFixed(2)}`,
          });
        });
      } else if (type === 'alerts') {
        worksheet.columns = [
          { header: 'Date', key: 'date', width: 20 },
          { header: 'Type', key: 'type', width: 20 },
          { header: 'Product', key: 'product', width: 30 },
          { header: 'Message', key: 'message', width: 40 },
          { header: 'Resolved', key: 'resolved', width: 12 },
        ];
        
        data.alerts.forEach(alert => {
          worksheet.addRow({
            date: new Date(alert.date).toLocaleString(),
            type: alert.type,
            product: alert.product,
            message: alert.message,
            resolved: alert.resolved ? 'Yes' : 'No',
          });
        });
      }

      formatExcelWorksheet(worksheet, worksheet.getRow(1));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-report.xlsx`);
      
      await workbook.xlsx.write(res);
      return res.end();
    }

    // PDF format
    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-report.pdf`);
      
      doc.pipe(res);
      
      addPDFHeader(doc, reportTitle, user);

      if (type === 'sales') {
        doc.fontSize(12).font('Helvetica-Bold').text('Sales Summary', { underline: true });
        doc.fontSize(10).font('Helvetica')
          .text(`Total Sales: ${data.totalSales}`)
          .text(`Total Revenue: KES ${data.totalRevenue.toFixed(2)}`);
        doc.moveDown(1);

        doc.fontSize(12).font('Helvetica-Bold').text('Recent Sales:', { underline: true });
        doc.moveDown(0.5);
        
        data.sales.slice(0, 50).forEach((sale, idx) => {
          if (doc.y > 700) doc.addPage();
          doc.fontSize(9).font('Helvetica')
            .text(`${idx + 1}. ${new Date(sale.date).toLocaleString()} - ${sale.staff}`)
            .text(`   Payment: ${sale.paymentMethod} | Total: KES ${sale.totalAmount}`, { indent: 20 });
          sale.items.forEach(item => {
            doc.text(`   • ${item.product}: ${item.quantity} × KES ${item.amount}`, { indent: 30 });
          });
          doc.moveDown(0.3);
        });
      } else if (type === 'inventory') {
        doc.fontSize(12).font('Helvetica-Bold').text(`Total Movements: ${data.totalMovements}`, { underline: true });
        doc.moveDown(1);

        data.movements.slice(0, 100).forEach((movement, idx) => {
          if (doc.y > 700) doc.addPage();
          doc.fontSize(9).font('Helvetica')
            .text(`${idx + 1}. ${new Date(movement.date).toLocaleString()}`)
            .text(`   ${movement.type}: ${movement.product} (${movement.quantity})`, { indent: 20 })
            .text(`   ${movement.description} - by ${movement.user}`, { indent: 20 });
          doc.moveDown(0.3);
        });
      } else if (type === 'staff-performance') {
        doc.fontSize(12).font('Helvetica-Bold').text(`Staff Count: ${data.totalStaff}`, { underline: true });
        doc.moveDown(1);

        data.performance.forEach((perf, idx) => {
          if (doc.y > 700) doc.addPage();
          doc.fontSize(10).font('Helvetica')
            .text(`${idx + 1}. ${perf.staff}`)
            .text(`   Sales: ${perf.salesCount} | Revenue: KES ${perf.totalRevenue.toFixed(2)}`, { indent: 20 });
          doc.moveDown(0.5);
        });
      } else if (type === 'alerts') {
        doc.fontSize(12).font('Helvetica-Bold').text(`Total Alerts: ${data.totalAlerts}`, { underline: true });
        doc.moveDown(1);

        data.alerts.slice(0, 100).forEach((alert, idx) => {
          if (doc.y > 700) doc.addPage();
          doc.fontSize(9).font('Helvetica')
            .text(`${idx + 1}. [${alert.type}] ${alert.product} - ${alert.resolved ? 'Resolved' : 'Pending'}`)
            .text(`   ${alert.message}`, { indent: 20 })
            .text(`   ${new Date(alert.date).toLocaleString()}`, { indent: 20 });
          doc.moveDown(0.3);
        });
      }

      doc.end();
      return;
    }

    // JSON format (default)
    res.json({
      success: true,
      reportType: type,
      format,
      generatedAt: new Date().toISOString(),
      generatedBy: user?.email,
      data,
    });
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: error.message,
    });
  }
};

/**
 * POST /api/reports/admin-export
 * Export admin-level reports
 */
export const exportAdminReport = async (req, res) => {
  try {
    const { type = 'system', format = 'json' } = req.body;

    // Verify admin-only access
    if (!['ADMIN', 'SUPERADMIN'].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    let data = {};

    switch (type) {
      case 'system':
        data = await getSystemReport();
        break;
      case 'users':
        data = await getUsersReport();
        break;
      case 'audit':
        data = await getAuditReport();
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type',
        });
    }

    res.json({
      success: true,
      reportType: type,
      format,
      generatedAt: new Date().toISOString(),
      data,
    });
  } catch (error) {
    console.error('Error exporting admin report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export admin report',
      error: error.message,
    });
  }
};

// Helper functions
async function getSalesReport() {
  const sales = await prisma.sale.findMany({
    include: {
      items: {
        include: {
          product: { select: { name: true } },
        },
      },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  return {
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
    sales: sales.map((s) => ({
      date: s.createdAt,
      items: s.items.map((i) => ({
        product: i.product?.name,
        quantity: i.quantity,
        amount: i.total,
      })),
      totalAmount: s.totalAmount,
      paymentMethod: s.paymentMethod,
      staff: s.user?.name,
    })),
  };
}

async function getInventoryReport() {
  const movements = await prisma.inventoryMovement.findMany({
    include: {
      product: { select: { name: true } },
      user: { select: { name: true } },
    },
    orderBy: { timestamp: 'desc' },
    take: 500,
  });

  return {
    totalMovements: movements.length,
    movements: movements.map((m) => ({
      date: m.timestamp,
      product: m.product?.name,
      type: m.type,
      quantity: m.quantity,
      description: m.description,
      user: m.user?.name,
    })),
  };
}

async function getStaffPerformanceReport() {
  const staffSales = await prisma.sale.groupBy({
    by: ['userId'],
    _count: { id: true },
    _sum: { totalAmount: true },
  });

  const staffDetails = await prisma.user.findMany({
    where: { role: 'STAFF' },
    select: { id: true, name: true, email: true },
  });

  return {
    totalStaff: staffDetails.length,
    performance: staffSales.map((stat) => {
      const staff = staffDetails.find((s) => s.id === stat.userId);
      return {
        staff: staff?.name,
        salesCount: stat._count.id,
        totalRevenue: stat._sum.totalAmount || 0,
      };
    }),
  };
}

async function getAlertsReport() {
  const alerts = await prisma.alert.findMany({
    include: { product: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  return {
    totalAlerts: alerts.length,
    alerts: alerts.map((a) => ({
      date: a.createdAt,
      type: a.type,
      product: a.product?.name,
      message: a.message,
      resolved: a.resolved,
    })),
  };
}

async function getSystemReport() {
  const users = await prisma.user.count();
  const products = await prisma.product.count();
  const sales = await prisma.sale.count();

  return {
    systemHealth: 'operational',
    timestamp: new Date(),
    statistics: {
      totalUsers: users,
      totalProducts: products,
      totalSales: sales,
    },
  };
}

async function getUsersReport() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return {
    totalUsers: users.length,
    users,
  };
}

async function getAuditReport() {
  const logs = await prisma.activityLog.findMany({
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { timestamp: 'desc' },
    take: 1000,
  });

  return {
    totalLogs: logs.length,
    logs: logs.map((l) => ({
      timestamp: l.timestamp,
      user: l.user?.email,
      action: l.action,
      description: l.description,
      status: l.status,
    })),
  };
}
