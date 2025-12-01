/*
  Warnings:

  - You are about to drop the column `lowStockThreshold` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "lowStockThreshold",
ADD COLUMN     "overStockLimit" INTEGER NOT NULL DEFAULT 500,
ADD COLUMN     "reorderPoint" INTEGER NOT NULL DEFAULT 10;
