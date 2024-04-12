#!/usr/bin/env bash
set -e

# assuming already logged into vault 
ADMIN_EMAIL=$(vault read -field=superUserEmail secret/packit/basicauth)
ADMIN_PASSWORD_ENCODED=$(vault read -field=superUserEncodedPassword secret/packit/basicauth)
ADMIN_UUID=$(vault read -field=superAdminUUID secret/packit/basicauth)

docker exec packit-db wait-for-db
docker exec -it packit-db psql -U packituser -d packit -c \
"INSERT INTO \"user\" (\"id\", \"username\", \"display_name\", \"password\", \"email\", \"disabled\", \"user_source\", \"last_logged_in\") 
VALUES ('$ADMIN_UUID', '$ADMIN_EMAIL', 'Super Admin', '$ADMIN_PASSWORD_ENCODED', '$ADMIN_EMAIL', FALSE, 'basic', NOW());
INSERT INTO user_group_user (\"user_id\", \"user_group_id\") values ('$ADMIN_UUID', 1)"
