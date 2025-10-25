import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Product } from "./Product.js";

export const SaleRecord = sequelize.define("SaleRecord", {
  quantity_sold: { type: DataTypes.INTEGER, allowNull: false },
  sale_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: false,
});

// Relations
SaleRecord.belongsTo(Product, { foreignKey: "productId", as: "product" });
