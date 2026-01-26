// settings.controller.js
// Controller for managing application settings


import prisma from '../prisma/client.js';

// Get all settings
export const getSettings = async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    // Convert array of objects to a single object for easier frontend use
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    res.json(settingsMap);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings' });
  }
};

// Update settings
export const updateSettings = async (req, res) => {
  const { settings } = req.body; // Expect an array of { key, value }
  
  if (!Array.isArray(settings)) {
    return res.status(400).json({ message: 'Request body must be an array of settings' });
  }

  try {
    const transaction = settings.map(setting => 
      prisma.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      })
    );

    await prisma.$transaction(transaction);
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings' });
  }
};
