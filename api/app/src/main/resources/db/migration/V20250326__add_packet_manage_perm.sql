-- add pakcet.manage permission
INSERT into "permission" ("name", "description")
VALUES ('packet.manage', 'Manage read permission on packets')
ON CONFLICT ("name") DO NOTHING;

-- add packet.manage permission to admin role
INSERT
INTO "role_permission" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "role" r
         CROSS JOIN "permission" p
WHERE r.name = 'ADMIN'
  AND p.name = 'packet.manage'