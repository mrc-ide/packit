import { RoleWithRelationships } from "../types/RoleWithRelationships";
import { UserWithRoles } from "../types/UserWithRoles";

export const getUsersWithRoles = (
  nonUsernameRoles: RoleWithRelationships[],
  usernameRoles: RoleWithRelationships[]
): UserWithRoles[] => {
  const usersData: Record<string, UserWithRoles> = {};

  addRolesToUserData(nonUsernameRoles, usersData);
  addSpecificPermissionsToUserData(usernameRoles, usersData);

  return getSortedUsersWithRoles(usersData);
};

// Helper functions

export const addRolesToUserData = (
  nonUsernameRoles: RoleWithRelationships[],
  usersData: Record<string, UserWithRoles>
) => {
  for (const role of nonUsernameRoles) {
    for (const user of role.users) {
      createBasicUserWithRoleIfNotExists(user.username, user.id, usersData);
      usersData[user.username].roles.push({ name: role.name, id: role.id });
    }
  }
};

export const addSpecificPermissionsToUserData = (
  usernameRoles: RoleWithRelationships[],
  usersData: Record<string, UserWithRoles>
) => {
  for (const role of usernameRoles) {
    // username roles only have one user which is the username itself
    createBasicUserWithRoleIfNotExists(role.name, role.users?.[0].id, usersData);
    usersData[role.name].specificPermissions = role.rolePermissions;
  }
};

export const getSortedUsersWithRoles = (usersData: Record<string, UserWithRoles>) =>
  Object.keys(usersData)
    .sort()
    .map((key) => usersData[key]);

export const createBasicUserWithRoleIfNotExists = (
  username: string,
  id: string,
  usersData: Record<string, UserWithRoles>
) => {
  if (!usersData[username]) {
    usersData[username] = { username, id, roles: [], specificPermissions: [] };
  }
};
