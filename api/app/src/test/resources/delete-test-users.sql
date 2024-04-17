-- delete all users except super admin
DELETE
FROM "user"
WHERE display_name NOT IN ('Super Admin');