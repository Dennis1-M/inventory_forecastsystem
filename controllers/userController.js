// controllers/userController.js
import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";

// ---------------- Get All Users ----------------
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { name: "asc" },
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users.", error: err.message });
  }
};

// ---------------- Get User by ID ----------------
export const getUserById = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid user ID." });

  try {
    const user = await prisma.user.findFirst({
      where: { id, isActive: true },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user.", error: err.message });
  }
};

// ---------------- Update User ----------------
export const updateUser = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid user ID." });

  const { name, email, password, role } = req.body;
  const data = {};

  if (role && req.user.role !== "SUPERADMIN") {
    return res.status(403).json({ message: "Only SUPERADMIN can change roles." });
  }

  if (name) data.name = name;
  if (email) data.email = email;
  if (role) data.role = role;
  if (password) data.password = await bcrypt.hash(password, 10);

  if (Object.keys(data).length === 0)
    return res.status(400).json({ message: "No fields provided to update." });

  try {
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_USER",
        performedById: req.user.id,
        targetUserId: id,
      },
    });

    res.status(200).json({ message: "User updated successfully.", user: updated });
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ message: "Email already exists." });
    res.status(500).json({ message: "Failed to update user.", error: err.message });
  }
};

// controllers/userController.js - Update deleteUser function
// ---------------- Delete User (Account Deletion) ----------------
export const deleteUser = async (req, res) => {
  const id = Number(req.params.id);
  const currentUser = req.user;
  
  if (isNaN(id)) {
    return res.status(400).json({ 
      success: false,
      message: "Invalid user ID." 
    });
  }

  try {
    // Get the user to delete
    const userToDelete = await prisma.user.findUnique({
      where: { id }
    });

    if (!userToDelete) {
      return res.status(404).json({ 
        success: false,
        message: "User not found." 
      });
    }

    // Check permissions
    const canDelete = 
      // User can delete themselves
      currentUser.id === id ||
      // SuperAdmin can delete anyone except other SuperAdmins
      (currentUser.role === "SUPERADMIN" && userToDelete.role !== "SUPERADMIN") ||
      // Admin can delete Managers and Staff
      (currentUser.role === "ADMIN" && ["MANAGER", "STAFF"].includes(userToDelete.role));

    if (!canDelete) {
      return res.status(403).json({ 
        success: false,
        message: "You don't have permission to delete this user." 
      });
    }

    // Prevent deleting the last SuperAdmin
    if (userToDelete.role === "SUPERADMIN") {
      const superAdminCount = await prisma.user.count({
        where: { role: "SUPERADMIN" }
      });
      
      if (superAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the last SuperAdmin in the system."
        });
      }
    }

    // Soft delete (deactivate) or hard delete
    const deleteMethod = process.env.DELETE_METHOD || "soft"; // "hard" or "soft"
    
    if (deleteMethod === "soft") {
      // Soft delete - mark as inactive
      await prisma.user.update({
        where: { id },
        data: { 
          isActive: false,
          email: `deleted_${Date.now()}_${userToDelete.email}`, // Change email to prevent reuse
          name: "[Deleted User]"
        },
      });
      console.log(`✅ User ${id} soft deleted (deactivated)`);
    } else {
      // Hard delete - remove from database
      await prisma.user.delete({
        where: { id }
      });
      console.log(`✅ User ${id} hard deleted from database`);
    }

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "DELETE_USER",
          performedById: currentUser.id,
          targetUserId: id,
          details: JSON.stringify({
            method: deleteMethod,
            userEmail: userToDelete.email,
            userRole: userToDelete.role
          })
        },
      });
    } catch (auditError) {
      console.warn("Audit log failed:", auditError);
    }

    res.status(200).json({ 
      success: true,
      message: `User account ${deleteMethod === 'soft' ? 'deactivated' : 'deleted'} successfully.` 
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete user.", 
      error: err.message 
    });
  }
};

// ---------------- Create New User ----------------
export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Name, email, password, and role are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
      select: { id: true, name: true, email: true, role: true },
    });

    res.status(201).json({ message: "User created successfully.", user });
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ message: "Email already exists." });
    res.status(500).json({ message: "Failed to create user.", error: err.message });
  }
};
