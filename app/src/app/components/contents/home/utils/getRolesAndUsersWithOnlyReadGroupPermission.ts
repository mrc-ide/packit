// Add roles/users multi selector. only add to ones that cant read alreadY!

import {
  canManagePacketGroup,
  canReadAllPackets,
  hasPacketReadPermissionForGroup
} from "../../../../../lib/auth/hasPermission";
import { mapPermissionsToNames } from "../../../../../lib/constructPermissionName";
import { RolePermission, RoleWithRelationships } from "../../manageAccess/types/RoleWithRelationships";
import { UserWithRoles } from "../../manageAccess/types/UserWithRoles";

/**
 * This function retrieves roles and users that have only have read permissions for a specific packet group.
 * It does NOT include those with global read permissions, manage permissions, etc.
 */
export const getRolesAndUsersWithOnlyReadGroupPermission = (
  roles: RoleWithRelationships[],
  users: UserWithRoles[],
  packetGroupName: string
): (RoleWithRelationships | UserWithRoles)[] => {
  const rolesWithRead = roles.filter((role) => hasOnlyReadGroupPermission(role.rolePermissions, packetGroupName));

  const usersWithRead = users.filter((user) => hasOnlyReadGroupPermission(user.specificPermissions, packetGroupName));

  return [...rolesWithRead, ...usersWithRead];
};

const hasOnlyReadGroupPermission = (permissions: RolePermission[], packetGroupName: string) => {
  const permissionNames = mapPermissionsToNames(permissions);

  return (
    hasPacketReadPermissionForGroup(permissionNames, packetGroupName) &&
    !canReadAllPackets(permissionNames) &&
    !canManagePacketGroup(permissionNames, packetGroupName)
  );
};
