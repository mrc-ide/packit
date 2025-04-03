// Add roles/users multi selector. only add to ones that cant read alreadY!

import { hasPacketReadPermissionForGroup } from "../../../../../lib/auth/hasPermission";
import { mapPermissionsToNames } from "../../../../../lib/constructPermissionName";
import { RoleWithRelationships } from "../../manageAccess/types/RoleWithRelationships";
import { UserWithRoles } from "../../manageAccess/types/UserWithRoles";

/**
 * This function retrieves roles and users that have read permissions for a specific packet group.
 * It does NOT include those with global read permissions, manage permissions, etc.
 */
export const getRoleUsersWithReadGroupPermission = (
  roles: RoleWithRelationships[],
  users: UserWithRoles[],
  packetGroupName: string
): (RoleWithRelationships | UserWithRoles)[] => {
  const rolesWithRead = roles.filter((role) =>
    hasPacketReadPermissionForGroup(mapPermissionsToNames(role.rolePermissions), packetGroupName)
  );

  const usersWithRead = users.filter((user) =>
    hasPacketReadPermissionForGroup(mapPermissionsToNames(user.specificPermissions), packetGroupName)
  );

  return [...rolesWithRead, ...usersWithRead];
};
