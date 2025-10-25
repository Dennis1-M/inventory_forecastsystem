-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('EXPIRY', 'STOCK', 'FORECAST');

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "alertType" "AlertType" NOT NULL,
    "message" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
