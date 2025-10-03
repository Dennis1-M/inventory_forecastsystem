import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Supplier = sequelize.define("Supplier", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true, validate: { isEmail: true } },
  phone: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
}, {
  timestamps: true,
});
