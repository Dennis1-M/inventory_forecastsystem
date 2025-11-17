/*
  Warnings:

  - You are about to drop the column `predictedValue` on the `ForecastPoint` table. All the data in the column will be lost.
  - Added the required column `predicted` to the `ForecastPoint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Alert" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ForecastPoint" DROP COLUMN "predictedValue",
ADD COLUMN     "predicted" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Inventory" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Supplier" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
