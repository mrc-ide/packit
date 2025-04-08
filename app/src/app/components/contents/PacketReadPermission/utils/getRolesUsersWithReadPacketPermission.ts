import { hasPacketReadPermissionForPacket } from "../../../../../lib/auth/hasPermission";
import { mapPermissionsToNames } from "../../../../../lib/constructPermissionName";
import { RoleWithRelationships } from "../../manageAccess/types/RoleWithRelationships";
import { UserWithRoles } from "../../manageAccess/types/UserWithRoles";

/**
 * This function retrieves roles and users that have read permissions for a specific packet.
 * It does NOT include those with packet group/global read permissions, manage permissions, etc.
 */
export const getRolesUsersWithReadPacketPermission = (
  roles: RoleWithRelationships[],
  users: UserWithRoles[],
  packetGroupName: string,
  packetId: string
) => {
  const rolesWithRead = roles.filter((role) =>
    hasPacketReadPermissionForPacket(mapPermissionsToNames(role.rolePermissions), packetGroupName, packetId)
  );

  const usersWithRead = users.filter((user) =>
    hasPacketReadPermissionForPacket(mapPermissionsToNames(user.specificPermissions), packetGroupName, packetId)
  );

  return [...rolesWithRead, ...usersWithRead];
};
