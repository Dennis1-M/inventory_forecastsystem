import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Product } from "./Product.js";

export const Alert = sequelize.define("Alert", {
  alert_type: {
    type: DataTypes.ENUM("EXPIRY", "STOCK", "FORECAST"),
    allowNull: false,
  },
  message: { type: DataTypes.TEXT, allowNull: false },
  resolved: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  timestamps: true,
});

// Relations
Alert.belongsTo(Product, { foreignKey: "productId", as: "product" });
