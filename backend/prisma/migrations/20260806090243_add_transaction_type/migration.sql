-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SALE', 'PAYMENT');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "type" "TransactionType" NOT NULL DEFAULT 'SALE';

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");
