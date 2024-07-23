-- add base roles
INSERT INTO "role"
    ("name", is_username)
VALUES ('ADMIN', false);

-- add base permissions
INSERT INTO "permission"
    ("name", "description")
VALUES ('packet.read', 'Read packets'),
       ('packet.run', 'Run packets'),
       ('outpack.read', 'Read from outpack server'),
       ('outpack.write', 'Write to outpack server'),
       ('user.manage', 'Manage users');


-- Insert the relationships between 'ADMIN' role and permissions into the role_permission table
WITH permission_ids AS (SELECT id
                        FROM "permission")
INSERT
INTO "role_permission" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "role" r
         CROSS JOIN permission_ids p
WHERE r.name = 'ADMIN';
