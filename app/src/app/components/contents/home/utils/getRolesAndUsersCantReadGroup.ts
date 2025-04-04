// roles and users that cant read the packet group (inc global read, manage etc..)
// no point adding if they have global read, manage etc... because it wont do anything to add

import { canReadPacketGroup } from "../../../../../lib/auth/hasPermission";
import { mapPermissionsToNames } from "../../../../../lib/constructPermissionName";
import { RoleWithRelationships } from "../../manageAccess/types/RoleWithRelationships";
import { UserWithRoles } from "../../manageAccess/types/UserWithRoles";

/**
 * This function retrieves roles and users that cannot read a specific packet group.
 * It includes those with global read permissions, manage permissions, etc.
 */
export const getRolesAndUsersCantReadGroup = (
  roles: RoleWithRelationships[],
  users: UserWithRoles[],
  packetGroupName: string
): (RoleWithRelationships | UserWithRoles)[] => {
  const rolesCantRead = roles.filter(
    (role) => !canReadPacketGroup(mapPermissionsToNames(role.rolePermissions), packetGroupName)
  );

  const usersCantRead = users.filter(
    (user) =>
      !userHasDirectReadPermission(user, packetGroupName) && !userHasReadPermissionViaRole(user, roles, packetGroupName)
  );

  // sorted by roles first
  return [...rolesCantRead, ...usersCantRead];
};

/**
 * Checks if a user has direct read access to the given packet group
 */
const userHasDirectReadPermission = (user: UserWithRoles, packetGroupName: string): boolean =>
  canReadPacketGroup(mapPermissionsToNames(user.specificPermissions), packetGroupName);

/**
 * Checks if a user has read access via their assigned roles
 */
const userHasReadPermissionViaRole = (
  user: UserWithRoles,
  roles: RoleWithRelationships[],
  packetGroupName: string
): boolean =>
  user.roles.some((role) =>
    canReadPacketGroup(mapPermissionsToNames(roles.find((r) => r.name === role.name)?.rolePermissions), packetGroupName)
  );
