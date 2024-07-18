DELETE
from "permission"
WHERE name = 'packet.push';

INSERT into "permission" ("name", "description")
VALUES ('outpack.read', 'Read from outpack server'),
       ('outpack.write', 'Write to outpack server');

-- give admin role new permissions
WITH permission_ids AS (SELECT id
                        FROM "permission"
                        WHERE name IN ('outpack.read', 'outpack.write'))
INSERT
INTO "role_permission" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "role" r
         CROSS JOIN permission_ids p;
