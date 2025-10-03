import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const User = sequelize.define("User", {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  phone: { type: DataTypes.STRING, unique: true, allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  password: { type: DataTypes.STRING, allowNull: false }, // hashed
}, {
  timestamps: true,
});
