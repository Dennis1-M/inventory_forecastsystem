// controllers/setupController.js
// Controller for managing initial setup: creating the first SuperAdmin user


import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

/**
 * Checks if the initial setup (SuperAdmin creation) has been performed.
 * @route GET /api/setup/status
 */
export const checkInitialSetup = async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const setupNeeded = userCount === 0;
    res.status(200).json({ setupNeeded });
  } catch (error) {
    console.error('Error checking initial setup:', error);
    res.status(500).json({ message: 'Server error while checking setup status.' });
  }
};

/**
 * Performs the initial setup by creating the first SuperAdmin user.
 * This should only be callable when no other users exist.
 * @route POST /api/setup/run
 */
export const performInitialSetup = async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return res.status(403).json({ message: 'Initial setup has already been completed.' });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'SUPERADMIN',
        isActive: true,
      },
    });

    // Generate a token for the new SuperAdmin
    const token = jwt.sign(
      { id: superAdmin.id, role: superAdmin.role },
      process.env.JWT_SECRET || 'supersecretkey123',
      { expiresIn: '30d' }
    );
    
    const { password: _, ...userResponse } = superAdmin;

    res.status(201).json({
      message: 'SuperAdmin account created successfully. You are now logged in.',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Error performing initial setup:', error);
    res.status(500).json({ message: 'Server error during initial setup.' });
  }
};
