import { RolePermission, NewRolePermission } from "../app/components/contents/manageAccess/types/RoleWithRelationships";

export const constructPermissionName = ({
  permission,
  packet,
  tag,
  packetGroup
}: RolePermission | NewRolePermission) => {
  if (packet) {
    return `${permission}:packet:${packet.name}:${packet.id}`;
  }

  if (tag) {
    return `${permission}:tag:${tag.name}`;
  }

  if (packetGroup) {
    return `${permission}:packetGroup:${packetGroup.name}`;
  }

  return permission;
};
