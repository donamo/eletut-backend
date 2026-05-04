-- CreateEnum
CREATE TYPE "LifeEventColor" AS ENUM (
    'RED',
    'BLUE',
    'GREEN',
    'YELLOW',
    'ORANGE',
    'PURPLE',
    'PINK',
    'BROWN',
    'BLACK',
    'WHITE',
    'GRAY',
    'CYAN',
    'MAGENTA',
    'LIME',
    'INDIGO',
    'TEAL'
);

-- AlterTable
ALTER TABLE "LifeEvent" ADD COLUMN "importance" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "LifeEvent" ADD COLUMN "color" "LifeEventColor";

-- AddConstraint
ALTER TABLE "LifeEvent" ADD CONSTRAINT "LifeEvent_importance_check" CHECK ("importance" BETWEEN 1 AND 5);
