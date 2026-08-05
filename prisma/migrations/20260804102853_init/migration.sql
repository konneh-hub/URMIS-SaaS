-- CreateEnum
CREATE TYPE "InstitutionStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIAL');

-- AlterTable
ALTER TABLE "Institution" ADD COLUMN     "brandColor" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "status" "InstitutionStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "storageLimitMb" DOUBLE PRECISION NOT NULL DEFAULT 1024,
ADD COLUMN     "storageUsedMb" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "subscriptionExpiresAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionPlan" TEXT DEFAULT 'free',
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "InstitutionSetting" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "language" TEXT NOT NULL DEFAULT 'en',
    "theme" TEXT NOT NULL DEFAULT 'default',
    "brandColor" TEXT,
    "logoUrl" TEXT,
    "customDomain" TEXT,
    "supportEmail" TEXT,
    "enableMultiCampus" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionStatistics" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "studentCount" INTEGER NOT NULL DEFAULT 0,
    "courseCount" INTEGER NOT NULL DEFAULT 0,
    "storageUsedMb" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "storageLimitMb" DOUBLE PRECISION NOT NULL DEFAULT 1024,
    "dailyActiveUsers" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionActivityLog" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "performedBy" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstitutionActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionAuditLog" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "details" TEXT,
    "performedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstitutionAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionSetting_institutionId_key" ON "InstitutionSetting"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionStatistics_institutionId_key" ON "InstitutionStatistics"("institutionId");

-- AddForeignKey
ALTER TABLE "InstitutionSetting" ADD CONSTRAINT "InstitutionSetting_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionStatistics" ADD CONSTRAINT "InstitutionStatistics_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionActivityLog" ADD CONSTRAINT "InstitutionActivityLog_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionAuditLog" ADD CONSTRAINT "InstitutionAuditLog_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
