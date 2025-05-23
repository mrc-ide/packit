-- delete all test users and roles
DELETE
FROM "user"
WHERE username ILIKE '%test%';

DELETE
FROM "role"
WHERE name ILIKE '%test%'