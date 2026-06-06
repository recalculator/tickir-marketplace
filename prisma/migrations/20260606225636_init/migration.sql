-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BORROWER', 'LENDER_USER', 'LENDER_ADMIN', 'PLATFORM_ADMIN');

-- CreateEnum
CREATE TYPE "LenderStatus" AS ENUM ('PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "LenderMemberRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'ANONYMIZED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "InterestStatus" AS ENUM ('INTERESTED', 'ACCEPTED', 'DECLINED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'BORROWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lender" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "logoUrl" TEXT,
    "location" TEXT,
    "status" "LenderStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LenderMember" (
    "id" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "LenderMemberRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LenderMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LenderPreferences" (
    "id" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "minLoanAmount" INTEGER,
    "maxLoanAmount" INTEGER,
    "allowedGeographies" JSONB NOT NULL DEFAULT '[]',
    "allowedIndustries" JSONB NOT NULL DEFAULT '[]',
    "loanTypes" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LenderPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanRequest" (
    "id" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "locationCity" TEXT NOT NULL,
    "locationState" TEXT NOT NULL,
    "yearsInBusiness" INTEGER NOT NULL,
    "revenueBand" TEXT NOT NULL,
    "requestedAmountMin" INTEGER NOT NULL,
    "requestedAmountMax" INTEGER NOT NULL,
    "loanPurposeShort" TEXT NOT NULL,
    "loanPurposeDetails" TEXT NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'ANONYMIZED',
    "status" "RequestStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoanRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LenderInterest" (
    "id" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "loanRequestId" TEXT NOT NULL,
    "status" "InterestStatus" NOT NULL DEFAULT 'INTERESTED',
    "introMessage" TEXT,
    "underwriterDealId" TEXT,
    "importedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LenderInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "lenderInterestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LenderMember_userId_key" ON "LenderMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LenderPreferences_lenderId_key" ON "LenderPreferences"("lenderId");

-- CreateIndex
CREATE INDEX "LoanRequest_locationState_status_idx" ON "LoanRequest"("locationState", "status");

-- CreateIndex
CREATE INDEX "LoanRequest_requestedAmountMin_requestedAmountMax_idx" ON "LoanRequest"("requestedAmountMin", "requestedAmountMax");

-- CreateIndex
CREATE INDEX "LoanRequest_industry_status_idx" ON "LoanRequest"("industry", "status");

-- CreateIndex
CREATE INDEX "LoanRequest_status_idx" ON "LoanRequest"("status");

-- CreateIndex
CREATE INDEX "LenderInterest_loanRequestId_idx" ON "LenderInterest"("loanRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "LenderInterest_lenderId_loanRequestId_key" ON "LenderInterest"("lenderId", "loanRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_lenderInterestId_key" ON "Conversation"("lenderInterestId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "LenderMember" ADD CONSTRAINT "LenderMember_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Lender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LenderMember" ADD CONSTRAINT "LenderMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LenderPreferences" ADD CONSTRAINT "LenderPreferences_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Lender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanRequest" ADD CONSTRAINT "LoanRequest_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LenderInterest" ADD CONSTRAINT "LenderInterest_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Lender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LenderInterest" ADD CONSTRAINT "LenderInterest_loanRequestId_fkey" FOREIGN KEY ("loanRequestId") REFERENCES "LoanRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_lenderInterestId_fkey" FOREIGN KEY ("lenderInterestId") REFERENCES "LenderInterest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
