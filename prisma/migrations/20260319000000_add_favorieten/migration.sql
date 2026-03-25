-- CreateTable
CREATE TABLE "Favoriet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favoriet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Favoriet_userId_idx" ON "Favoriet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Favoriet_userId_entityType_entityId_key" ON "Favoriet"("userId", "entityType", "entityId");

-- AddForeignKey
ALTER TABLE "Favoriet" ADD CONSTRAINT "Favoriet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
