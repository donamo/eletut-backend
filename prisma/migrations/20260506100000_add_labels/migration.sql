-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" "LifeEventColor" NOT NULL DEFAULT 'GRAY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifeEventLabel" (
    "lifeEventId" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LifeEventLabel_pkey" PRIMARY KEY ("lifeEventId", "labelId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Label_ownerUserId_name_key" ON "Label"("ownerUserId", "name");

-- CreateIndex
CREATE INDEX "Label_ownerUserId_name_idx" ON "Label"("ownerUserId", "name");

-- CreateIndex
CREATE INDEX "LifeEventLabel_labelId_idx" ON "LifeEventLabel"("labelId");

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeEventLabel" ADD CONSTRAINT "LifeEventLabel_lifeEventId_fkey" FOREIGN KEY ("lifeEventId") REFERENCES "LifeEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeEventLabel" ADD CONSTRAINT "LifeEventLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;
