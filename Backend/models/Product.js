import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Category } from "./Category.js";
import { Supplier } from "./Supplier.js";

export const Product = sequelize.define("Product", {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  quantity_in_stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  expiry_date: { type: DataTypes.DATEONLY, allowNull: true },
}, { timestamps: true });

// Relations
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });
Product.belongsTo(Supplier, { foreignKey: "supplierId", as: "supplier" });
