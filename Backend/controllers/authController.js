// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

// Helper function to format user response (exclude password)
const formatUserResponse = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// @desc    Check if SuperAdmin exists
// @route   GET /api/auth/check-superadmin
// @access  Public
export const checkSuperAdminExists = async (req, res) => {
  try {
    const superAdmin = await prisma.user.findFirst({ 
      where: { 
        role: "SUPERADMIN"
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    
    res.status(200).json({ 
      exists: !!superAdmin,
      message: superAdmin ? "Super Admin exists" : "No Super Admin found",
      superAdmin: superAdmin || null
    });
  } catch (error) {
    console.error("Error checking SuperAdmin:", error);
    res.status(500).json({ 
      exists: false, 
      message: "Server error checking SuperAdmin status" 
    });
  }
};

// @desc    Register Super Admin (first-time setup)
// @route   POST /api/auth/register-superuser
// @access  Public
export const registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Please provide name, email, and password" 
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Please provide a valid email address" 
      });
    }

    // Check if SuperAdmin already exists
    const existingSuperAdmin = await prisma.user.findFirst({ 
      where: { role: "SUPERADMIN" } 
    });
    
    if (existingSuperAdmin) {
      return res.status(400).json({ 
        message: "Super Admin already exists. Please login instead." 
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: "Email already registered. Please use a different email." 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Super Admin
    const superAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "SUPERADMIN",
        isActive: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: superAdmin.id, 
        email: superAdmin.email,
        role: superAdmin.role
      },
      process.env.JWT_SECRET || "supersecretkey123",
      { expiresIn: "30d" }
    );

    res.status(201).json({
      message: "Super Admin created successfully!",
      token,
      user: formatUserResponse(superAdmin)
    });

  } catch (error) {
    console.error("Super Admin registration error:", error);
    
    // Handle Prisma unique constraint error (P2002)
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      return res.status(400).json({ 
        message: `${field ? field.charAt(0).toUpperCase() + field.slice(1) : 'Field'} already exists` 
      });
    }
    
    res.status(500).json({ 
      message: "Server error during registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Please provide email and password" 
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (!user) {
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        message: "Account is deactivated. Please contact your administrator." 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    // Update last login (if you have this field)
    // Note: Your schema doesn't have lastLogin, so we'll update updatedAt
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        updatedAt: new Date()
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || "supersecretkey123",
      { expiresIn: "30d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      message: "Server error during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};


// @desc    Verify JWT token
// @route   GET /api/auth/verify-token
// @access  Public
export const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        valid: false, 
        message: 'No token provided' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey123");

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        valid: false, 
        message: 'User not found' 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        valid: false, 
        message: 'Account deactivated' 
      });
    }

    res.json({ 
      valid: true, 
      user 
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        valid: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    console.error('Token verification error:', error);
    res.status(500).json({ 
      valid: false, 
      message: 'Server error' 
    });
  }
};








// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    // req.user is already set by protect middleware
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Get fresh data from database to include all fields
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json(freshUser);
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ 
      message: "Server error fetching user data" 
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = (req, res) => {
  // Note: JWT tokens are stateless, logout is handled client-side
  res.status(200).json({ 
    message: "Logged out successfully" 
  });
};

// @desc    Register new user (by Super Admin or Admin)
// @route   POST /api/auth/register
// @access  Private (Admin/SuperAdmin only)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const requestingUser = req.user; // Set by protect middleware

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        message: "Please provide name, email, password, and role" 
      });
    }

    // Validate role
    const validRoles = ["SUPERADMIN", "ADMIN", "MANAGER", "STAFF"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: `Invalid role. Must be one of: ${validRoles.join(", ")}` 
      });
    }

    // Check permissions
    // Only SuperAdmin can create SuperAdmin
    if (role === "SUPERADMIN" && requestingUser.role !== "SUPERADMIN") {
      return res.status(403).json({ 
        message: "Only Super Admin can create another Super Admin" 
      });
    }

    // Admin can only create MANAGER and STAFF
    if (requestingUser.role === "ADMIN" && !["MANAGER", "STAFF"].includes(role)) {
      return res.status(403).json({ 
        message: "Admin can only create Manager or Staff accounts" 
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: "Email already registered" 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isActive: true,
        createdBy: requestingUser.id
      }
    });

    res.status(201).json({
      message: `User ${name} created successfully as ${role}`,
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error("User registration error:", error);
    
    // Handle Prisma unique constraint error
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        message: "Email already registered" 
      });
    }
    
    res.status(500).json({ 
      message: "Server error during user registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// @desc    Get all users (for SuperAdmin/Admin dashboard)
// @route   GET /api/auth/users
// @access  Private (Admin/SuperAdmin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ 
      message: "Server error fetching users" 
    });
  }
};

// @desc    Update user status (activate/deactivate)
// @route   PUT /api/auth/users/:id/status
// @access  Private (Admin/SuperAdmin only)
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const requestingUser = req.user;

    // Validate input
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ 
        message: "Please provide a valid isActive boolean value" 
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Check permissions
    // Can't deactivate yourself
    if (user.id === requestingUser.id) {
      return res.status(403).json({ 
        message: "Cannot change your own status" 
      });
    }

    // Only SuperAdmin can modify other SuperAdmins
    if (user.role === "SUPERADMIN" && requestingUser.role !== "SUPERADMIN") {
      return res.status(403).json({ 
        message: "Only Super Admin can modify other Super Admins" 
      });
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive }
    });

    res.status(200).json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: formatUserResponse(updatedUser)
    });

  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ 
      message: "Server error updating user status" 
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private (SuperAdmin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;

    // Only SuperAdmin can delete users
    if (requestingUser.role !== "SUPERADMIN") {
      return res.status(403).json({ 
        message: "Only Super Admin can delete users" 
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    // Can't delete yourself
    if (user.id === requestingUser.id) {
      return res.status(403).json({ 
        message: "Cannot delete your own account" 
      });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error("Delete user error:", error);
    
    // Handle foreign key constraint errors
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        message: "Cannot delete user because they have associated records" 
      });
    }
    
    res.status(500).json({ 
      message: "Server error deleting user" 
    });
  }
};