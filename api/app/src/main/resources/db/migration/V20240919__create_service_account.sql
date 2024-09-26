WITH
  inserted_user AS (
    INSERT INTO "user"("username", "display_name", "user_source")
    VALUES ('SERVICE', 'Service Account', 'service')
    RETURNING id
  )

INSERT INTO "user_role"("user_id", "role_id")
SELECT inserted_user.id, role.id
FROM inserted_user
CROSS JOIN "role"
WHERE role.name = 'ADMIN';
