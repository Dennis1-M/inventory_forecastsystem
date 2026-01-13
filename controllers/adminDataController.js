// Backend/controllers/adminDataController.js
import prisma from '../prisma/client.js';

export const clearSales = async (req, res) => {
  try {
    // Delete all sale items first (to avoid FK constraint)
    await prisma.saleItem.deleteMany({});
    // Delete all sales
    await prisma.sale.deleteMany({});
    res.json({ message: 'All sales data cleared.' });
  } catch (error) {
    console.error('Error clearing sales:', error);
    res.status(500).json({ message: 'Error clearing sales data.' });
  }
};

export const clearForecasts = async (req, res) => {
  try {
    // Delete all forecast points first (to avoid FK constraint)
    await prisma.forecastPoint.deleteMany({});
    // Delete all forecast runs
    await prisma.forecastRun.deleteMany({});
    res.json({ message: 'All forecast data cleared.' });
  } catch (error) {
    console.error('Error clearing forecasts:', error);
    res.status(500).json({ message: 'Error clearing forecast data.' });
  }
};

export const clearDataByType = async (req, res) => {
  const { dataType } = req.params;
  if (dataType === 'sales') return clearSales(req, res);
  if (dataType === 'forecasts') return clearForecasts(req, res);
  return res.status(400).json({ message: 'Invalid data type for clearing.' });
};
