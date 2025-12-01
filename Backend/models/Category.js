import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Category = sequelize.define("Category", {
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
}, {
  timestamps: true,
});








