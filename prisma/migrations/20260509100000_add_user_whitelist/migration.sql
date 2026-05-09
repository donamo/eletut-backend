-- Add user whitelist flag. Existing users start disabled and can be enabled manually
-- or automatically when their email matches ADMIN_EMAIL at Google login.
ALTER TABLE "User" ADD COLUMN "isEnabled" BOOLEAN NOT NULL DEFAULT false;
