-- insert admin user
INSERT INTO "user" ("id", "username", "display_name", "password", "email", "disabled", "user_source", "last_logged_in")
VALUES ('ad334e0b-6c62-45ea-bcc7-a03f747a617f', 'admin@example.com', 'test admin',
        '$2a$10$kU72ogo64j8omRjSAJQnPeEXIg2b/P6r7mVpi3g9rjzSBVcqOCaV2',
        'admin@example.com', FALSE, 'basic', '2024-04-05');
INSERT INTO "user_role" ("user_id", "role_id")
values ('ad334e0b-6c62-45ea-bcc7-a03f747a617f', 1);

--  insert regular user
INSERT INTO "user" ("id", "username", "display_name", "password", "email", "disabled", "user_source", "last_logged_in")
VALUES ('c8c54818-e8b4-47e2-a068-ca75c456b2de', 'user@example.com', 'test user',
        '$2a$10$kU72ogo64j8omRjSAJQnPeEXIg2b/P6r7mVpi3g9rjzSBVcqOCaV2',
        'user@example.com', FALSE, 'basic', '2024-04-05');
INSERT INTO "user_role" ("user_id", "role_id")
values ('ad334e0b-6c62-45ea-bcc7-a03f747a617f', 2);
