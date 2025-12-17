-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE "Sale" ALTER COLUMN "userId" DROP DEFAULT;
