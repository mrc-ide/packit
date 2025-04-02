// Add roles/users multi selector. only add to ones that cant read alreadY!

import { canReadPacketGroup, hasPacketReadPermissionForGroup } from "../../../../../lib/auth/hasPermission";
import { constructPermissionName } from "../../../../../lib/constructPermissionName";
import { RoleWithRelationships } from "../../manageAccess/types/RoleWithRelationships";
import { UserWithRoles } from "../../manageAccess/types/UserWithRoles";

// no point adding if they have global read, manage etc...
export const getRoleAndUsersWithoutReadGroup = (
  roles: RoleWithRelationships[],
  users: UserWithRoles[],
  packetGroupName: string
): (RoleWithRelationships | UserWithRoles)[] => {
  const rolesWithoutRead = roles.filter(
    (role) =>
      !canReadPacketGroup(
        role.rolePermissions.map((rp) => constructPermissionName(rp)),
        packetGroupName
      )
  );

  const usersWithoutRead = users.filter(
    (user) =>
      !canReadPacketGroup(
        user.specificPermissions.map((sp) => constructPermissionName(sp)),
        packetGroupName
      )
  );

  // sorted by roles first
  return [...rolesWithoutRead, ...usersWithoutRead];
};

// remove roles/users multi selector. only remove specific packetGroup permission!!!
// as this only removes specific packet.read:packetGroup:PacketGroupName
export const getRoleUsersWithReadGroup = (
  roles: RoleWithRelationships[],
  users: UserWithRoles[],
  packetGroupName: string
): (RoleWithRelationships | UserWithRoles)[] => {
  const rolesWithRead = roles.filter((role) =>
    hasPacketReadPermissionForGroup(
      role.rolePermissions.map((rp) => constructPermissionName(rp)),
      packetGroupName
    )
  );

  const usersWithRead = users.filter((user) =>
    hasPacketReadPermissionForGroup(
      user.specificPermissions.map((sp) => constructPermissionName(sp)),
      packetGroupName
    )
  );

  // sorted by roles first
  return [...rolesWithRead, ...usersWithRead];
};
