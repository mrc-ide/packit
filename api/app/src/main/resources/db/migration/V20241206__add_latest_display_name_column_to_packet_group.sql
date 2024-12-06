ALTER TABLE "packet_group"
    ADD COLUMN "latest_display_name" text DEFAULT '';

ALTER TABLE "packet_group"
    ALTER COLUMN "latest_display_name" SET NOT NULL;

ALTER TABLE "packet_group"
    ALTER COLUMN "latest_display_name" DROP DEFAULT;