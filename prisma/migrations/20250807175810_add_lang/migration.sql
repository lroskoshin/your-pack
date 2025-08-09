-- CreateEnum
CREATE TYPE "public"."UserLanguage" AS ENUM ('EN', 'RU');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "language" "public"."UserLanguage" NOT NULL DEFAULT 'EN';
