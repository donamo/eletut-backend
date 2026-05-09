-- Normalize existing label names to lower-case keys and merge case variants.
WITH ranked_labels AS (
    SELECT
        "id",
        "ownerUserId",
        lower("name") AS "normalizedName",
        row_number() OVER (
            PARTITION BY "ownerUserId", lower("name")
            ORDER BY "createdAt" ASC, "id" ASC
        ) AS "rank",
        first_value("id") OVER (
            PARTITION BY "ownerUserId", lower("name")
            ORDER BY "createdAt" ASC, "id" ASC
        ) AS "keptLabelId"
    FROM "Label"
),
duplicate_labels AS (
    SELECT "id", "keptLabelId"
    FROM ranked_labels
    WHERE "rank" > 1
)
INSERT INTO "LifeEventLabel" ("lifeEventId", "labelId", "createdAt")
SELECT "LifeEventLabel"."lifeEventId", duplicate_labels."keptLabelId", "LifeEventLabel"."createdAt"
FROM "LifeEventLabel"
JOIN duplicate_labels ON duplicate_labels."id" = "LifeEventLabel"."labelId"
ON CONFLICT ("lifeEventId", "labelId") DO NOTHING;

WITH ranked_labels AS (
    SELECT
        "id",
        row_number() OVER (
            PARTITION BY "ownerUserId", lower("name")
            ORDER BY "createdAt" ASC, "id" ASC
        ) AS "rank"
    FROM "Label"
)
DELETE FROM "LifeEventLabel"
USING ranked_labels
WHERE "LifeEventLabel"."labelId" = ranked_labels."id"
  AND ranked_labels."rank" > 1;

WITH ranked_labels AS (
    SELECT
        "id",
        row_number() OVER (
            PARTITION BY "ownerUserId", lower("name")
            ORDER BY "createdAt" ASC, "id" ASC
        ) AS "rank"
    FROM "Label"
)
DELETE FROM "Label"
USING ranked_labels
WHERE "Label"."id" = ranked_labels."id"
  AND ranked_labels."rank" > 1;

UPDATE "Label"
SET "name" = lower("name");
