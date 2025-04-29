import {
  canManagePacket,
  canReadPacketGroup,
  hasPacketReadPermissionForPacket
} from "../../../../../lib/auth/hasPermission";
import { mapPermissionsToNames } from "../../../../../lib/constructPermissionName";
import { RolePermission, RoleWithRelationships } from "../../manageAccess/types/RoleWithRelationships";
import { UserWithPermissions } from "../../manageAccess/types/UserWithPermissions";

/**
 * This function retrieves roles and users that have only have read permissions for a specific packet.
 * It does NOT include those with packet group/global read permissions, manage permissions, etc.
 */
export const getRolesUsersWithOnlyReadPacketPermission = (
  roles: RoleWithRelationships[],
  users: UserWithPermissions[],
  packetGroupName: string,
  packetId: string
) => {
  const rolesWithRead = roles.filter((role) =>
    hasOnlyPacketReadPermission(role.rolePermissions, packetGroupName, packetId)
  );

  const usersWithRead = users.filter((user) =>
    hasOnlyPacketReadPermission(user.specificPermissions, packetGroupName, packetId)
  );

  return [...rolesWithRead, ...usersWithRead];
};

const hasOnlyPacketReadPermission = (permissions: RolePermission[], packetGroupName: string, packetId: string) => {
  const permissionNames = mapPermissionsToNames(permissions);

  return (
    hasPacketReadPermissionForPacket(permissionNames, packetGroupName, packetId) &&
    !canReadPacketGroup(permissionNames, packetGroupName) &&
    !canManagePacket(permissionNames, packetGroupName, packetId)
  );
};
