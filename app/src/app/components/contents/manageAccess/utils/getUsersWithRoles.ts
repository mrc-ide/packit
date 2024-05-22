import { RoleWithRelationships } from "../types/RoleWithRelationships";
import { UserWithRoles } from "../types/UserWithRoles";

export const getUsersWithRoles = (
  nonUsernameRoles: RoleWithRelationships[],
  usernameRoles: RoleWithRelationships[]
): UserWithRoles[] => {
  const usersData: Record<string, UserWithRoles> = {};
  //   add roles to usersData
  for (const role of nonUsernameRoles) {
    for (const user of role.users || []) {
      if (!usersData[user.username]) {
        usersData[user.username] = { username: user.username, id: user.id, roles: [], specificPermissions: [] };
      }
      usersData[user.username].roles.push({ name: role.name, id: role.id });
    }
  }
  //   add specificPermissions to usersData
  for (const role of usernameRoles) {
    if (usersData[role.name]) {
      usersData[role.name].specificPermissions = role.rolePermissions;
    }
  }
  return Object.values(usersData);
};
