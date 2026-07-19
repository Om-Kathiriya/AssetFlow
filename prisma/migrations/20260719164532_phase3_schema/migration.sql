-- CreateEnum
CREATE TYPE "AllocationStatus" AS ENUM ('ACTIVE', 'RETURNED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Allocation" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "allocatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedReturnDate" TIMESTAMP(3) NOT NULL,
    "actualReturnDate" TIMESTAMP(3),
    "status" "AllocationStatus" NOT NULL DEFAULT 'ACTIVE',
    "conditionOnAllocation" TEXT,
    "conditionOnReturn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Allocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferRequest" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransferRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
