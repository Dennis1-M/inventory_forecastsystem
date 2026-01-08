/*
  Warnings:

  - Added the required column `updatedAt` to the `Alert` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AlertType" ADD VALUE 'EXPIRING_SOON';
ALTER TYPE "AlertType" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ForecastRun" ADD COLUMN     "accuracy" DOUBLE PRECISION,
ADD COLUMN     "method" TEXT NOT NULL DEFAULT 'EXPONENTIAL_SMOOTHING';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "ForecastPoint" (
    "id" SERIAL NOT NULL,
    "runId" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "predicted" DOUBLE PRECISION NOT NULL,
    "lower95" DOUBLE PRECISION,
    "upper95" DOUBLE PRECISION,

    CONSTRAINT "ForecastPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ForecastPoint_runId_idx" ON "ForecastPoint"("runId");

-- AddForeignKey
ALTER TABLE "ForecastPoint" ADD CONSTRAINT "ForecastPoint_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ForecastRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
