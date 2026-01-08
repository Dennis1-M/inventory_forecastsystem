-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "autoReorderEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reorderPoint" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "reorderQuantity" INTEGER NOT NULL DEFAULT 50;
