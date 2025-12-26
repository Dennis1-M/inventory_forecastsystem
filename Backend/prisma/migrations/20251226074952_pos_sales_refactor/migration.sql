/*
  Warnings:

  - You are about to drop the column `description` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `accuracy` on the `ForecastRun` table. All the data in the column will be lost.
  - You are about to drop the column `mae` on the `ForecastRun` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `ForecastRun` table. All the data in the column will be lost.
  - You are about to drop the column `costPrice` on the `InventoryMovement` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `InventoryMovement` table. All the data in the column will be lost.
  - You are about to drop the column `supplierId` on the `InventoryMovement` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `InventoryMovement` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `expiryDate` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `overStockLimit` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `reorderPoint` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `quantitySold` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `saleDate` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `totalSaleAmount` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `unitPriceSold` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `contactEmail` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `contactPhone` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Alert` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ForecastPoint` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `paymentMethod` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'MPESA', 'CARD');

-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_productId_fkey";

-- DropForeignKey
ALTER TABLE "ForecastPoint" DROP CONSTRAINT "ForecastPoint_runId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryMovement" DROP CONSTRAINT "InventoryMovement_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_productId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_createdBy_fkey";

-- DropIndex
DROP INDEX "InventoryMovement_supplierId_idx";

-- DropIndex
DROP INDEX "InventoryMovement_userId_idx";

-- DropIndex
DROP INDEX "Product_categoryId_idx";

-- DropIndex
DROP INDEX "Product_supplierId_idx";

-- DropIndex
DROP INDEX "Sale_productId_idx";

-- DropIndex
DROP INDEX "Sale_userId_idx";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "ForecastRun" DROP COLUMN "accuracy",
DROP COLUMN "mae",
DROP COLUMN "method";

-- AlterTable
ALTER TABLE "InventoryMovement" DROP COLUMN "costPrice",
DROP COLUMN "description",
DROP COLUMN "supplierId",
DROP COLUMN "timestamp",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "description",
DROP COLUMN "expiryDate",
DROP COLUMN "overStockLimit",
DROP COLUMN "reorderPoint",
ALTER COLUMN "categoryId" DROP DEFAULT,
ALTER COLUMN "sku" DROP DEFAULT,
ALTER COLUMN "unitPrice" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "notes",
DROP COLUMN "productId",
DROP COLUMN "quantitySold",
DROP COLUMN "saleDate",
DROP COLUMN "totalSaleAmount",
DROP COLUMN "unitPriceSold",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "contactEmail",
DROP COLUMN "contactPhone";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdBy";

-- DropTable
DROP TABLE "Alert";

-- DropTable
DROP TABLE "ForecastPoint";

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "saleId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SaleItem_saleId_idx" ON "SaleItem"("saleId");

-- CreateIndex
CREATE INDEX "SaleItem_productId_idx" ON "SaleItem"("productId");

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
