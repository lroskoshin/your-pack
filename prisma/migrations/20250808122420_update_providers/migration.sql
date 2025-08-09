/*
  Warnings:

  - You are about to drop the column `chatId` on the `TelegramProvider` table. All the data in the column will be lost.
  - You are about to drop the `SocialIntegration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubstackProvider` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[packId]` on the table `TelegramProvider` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chatName` to the `TelegramProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packId` to the `TelegramProvider` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."SocialIntegration" DROP CONSTRAINT "SocialIntegration_packId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SocialIntegration" DROP CONSTRAINT "SocialIntegration_substackProviderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SocialIntegration" DROP CONSTRAINT "SocialIntegration_telegramProviderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SocialIntegration" DROP CONSTRAINT "SocialIntegration_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SubstackProvider" DROP CONSTRAINT "SubstackProvider_userId_fkey";

-- DropIndex
DROP INDEX "public"."TelegramProvider_userId_chatId_key";

-- AlterTable
ALTER TABLE "public"."TelegramProvider" DROP COLUMN "chatId",
ADD COLUMN     "chatName" TEXT NOT NULL,
ADD COLUMN     "packId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."SocialIntegration";

-- DropTable
DROP TABLE "public"."SubstackProvider";

-- DropEnum
DROP TYPE "public"."Provider";

-- CreateTable
CREATE TABLE "public"."TwitterProvider" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TwitterProvider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TwitterProvider_packId_key" ON "public"."TwitterProvider"("packId");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramProvider_packId_key" ON "public"."TelegramProvider"("packId");

-- AddForeignKey
ALTER TABLE "public"."TelegramProvider" ADD CONSTRAINT "TelegramProvider_packId_fkey" FOREIGN KEY ("packId") REFERENCES "public"."Pack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TwitterProvider" ADD CONSTRAINT "TwitterProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TwitterProvider" ADD CONSTRAINT "TwitterProvider_packId_fkey" FOREIGN KEY ("packId") REFERENCES "public"."Pack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
