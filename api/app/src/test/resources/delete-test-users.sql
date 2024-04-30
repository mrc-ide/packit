-- delete all users and roles except super admin
DELETE
FROM "user"
WHERE display_name != 'Super Admin';

DELETE
FROM "role"
WHERE name != 'ADMIN'