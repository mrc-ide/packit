import { canReadPacket } from "../../../../../lib/auth/hasPermission";
import { mapPermissionsToNames } from "../../../../../lib/constructPermissionName";
import { RoleWithRelationships } from "../../manageAccess/types/RoleWithRelationships";
import { UserWithRoles } from "../../manageAccess/types/UserWithRoles";

/**
 * This function retrieves roles and users that cannot read a specific packet.
 * It includes those with packet group/global read permissions, manage permissions, etc.
 */
export const getRolesAndUsersCantReadPacket = (
  roles: RoleWithRelationships[],
  users: UserWithRoles[],
  packetGroupName: string,
  packetId: string
) => {
  const rolesCantRead = roles.filter(
    (role) => !canReadPacket(mapPermissionsToNames(role.rolePermissions), packetGroupName, packetId)
  );

  const usersCantRead = users.filter(
    (user) =>
      !userHasDirectReadPermission(user, packetGroupName, packetId) &&
      !userHasReadPermissionViaRole(user, roles, packetGroupName, packetId)
  );

  return [...rolesCantRead, ...usersCantRead];
};

/**
 * Checks if a user has direct read access to the given packet
 */
const userHasDirectReadPermission = (user: UserWithRoles, packetGroupName: string, packetId: string): boolean =>
  canReadPacket(mapPermissionsToNames(user.specificPermissions), packetGroupName, packetId);

/**
 * Checks if a user has read access via their assigned roles
 */
const userHasReadPermissionViaRole = (
  user: UserWithRoles,
  roles: RoleWithRelationships[],
  packetGroupName: string,
  packetId: string
): boolean =>
  user.roles.some((role) =>
    canReadPacket(
      mapPermissionsToNames(roles.find((r) => r.name === role.name)?.rolePermissions),
      packetGroupName,
      packetId
    )
  );
