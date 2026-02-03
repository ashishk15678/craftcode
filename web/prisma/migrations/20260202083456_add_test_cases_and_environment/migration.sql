-- CreateEnum
CREATE TYPE "EnvironmentType" AS ENUM ('C', 'CPP', 'NODE', 'PYTHON', 'RUST', 'GO', 'BASH');

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "environmentConfig" JSONB,
ADD COLUMN     "environmentType" "EnvironmentType";

-- CreateTable
CREATE TABLE "TestCase" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "input" TEXT,
    "expectedOutput" TEXT,
    "testScript" TEXT,
    "timeout" INTEGER NOT NULL DEFAULT 5000,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TestCase_lessonId_idx" ON "TestCase"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "TestCase_lessonId_order_key" ON "TestCase"("lessonId", "order");

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
