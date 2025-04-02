// Add roles/users multi selector. only add to ones that cant read alreadY!

import { canReadPacketGroup, hasPacketReadPermissionForGroup } from "../../../../../lib/auth/hasPermission";
import { constructPermissionName } from "../../../../../lib/constructPermissionName";
import { RoleWithRelationships } from "../../manageAccess/types/RoleWithRelationships";
import { UserWithRoles } from "../../manageAccess/types/UserWithRoles";

// roles and users that cant read the packet group (inc global read, manage etc..)
// no point adding if they have global read, manage etc... because it wont do anything to add
// Input to add roles/users multi selector
export const getRolesAndUsersCantReadGroup = (
  roles: RoleWithRelationships[],
  users: UserWithRoles[],
  packetGroupName: string
): (RoleWithRelationships | UserWithRoles)[] => {
  const rolesCantRead = roles.filter(
    (role) =>
      !canReadPacketGroup(
        role.rolePermissions.map((rp) => constructPermissionName(rp)),
        packetGroupName
      )
  );

  const usersCantRead = users.filter((user) => {
    const hasDirectPermission = canReadPacketGroup(
      user.specificPermissions.map((sp) => constructPermissionName(sp)),
      packetGroupName
    );
    if (hasDirectPermission) return false;

    const hasPermissionViaRole = user.roles?.some((role) =>
      canReadPacketGroup(
        roles.find((r) => r.name == role.name)?.rolePermissions.map((rp) => constructPermissionName(rp)),
        packetGroupName
      )
    );
    return !hasPermissionViaRole;
  });

  // sorted by roles first
  return [...rolesCantRead, ...usersCantRead];
};

// remove roles/users multi selector. only remove specific packetGroup permission!!!
// as this only removes specific packet.read:packetGroup:PacketGroupName
// Input to remove roles/users multi selector
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
