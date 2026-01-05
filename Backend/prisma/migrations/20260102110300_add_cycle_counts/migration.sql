-- CreateTable
CREATE TABLE "CycleCount" (
    "id" SERIAL NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "totalShrinkageQty" INTEGER NOT NULL DEFAULT 0,
    "totalShrinkageValue" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "CycleCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CycleCountItem" (
    "id" SERIAL NOT NULL,
    "cycleCountId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "expectedQty" INTEGER NOT NULL,
    "countedQty" INTEGER NOT NULL,
    "delta" INTEGER NOT NULL,
    "valueDelta" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CycleCountItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CycleCountItem_cycleCountId_idx" ON "CycleCountItem"("cycleCountId");

-- CreateIndex
CREATE INDEX "CycleCountItem_productId_idx" ON "CycleCountItem"("productId");

-- AddForeignKey
ALTER TABLE "CycleCount" ADD CONSTRAINT "CycleCount_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CycleCountItem" ADD CONSTRAINT "CycleCountItem_cycleCountId_fkey" FOREIGN KEY ("cycleCountId") REFERENCES "CycleCount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CycleCountItem" ADD CONSTRAINT "CycleCountItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
