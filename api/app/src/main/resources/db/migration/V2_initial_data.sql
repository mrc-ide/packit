-- add base roles
INSERT INTO "role"
    ("name")
VALUES ('ADMIN'),
       ('USER');

-- add base permissions
INSERT INTO "permission"
    ("name", "description")
VALUES ('packet.read', 'Read packets'),
       ('packet.run', 'Run packets'),
       ('packet.push', 'Push packets'),
       ('user.manage', 'Manage users');

