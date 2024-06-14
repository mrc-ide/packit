import { BaseRolePermission } from "../app/components/contents/manageAccess/types/RoleWithRelationships";

export const constructPermissionName = ({ permission, packet, tag, packetGroup }: BaseRolePermission) => {
  if (packet) {
    return `${permission}:packet:${packet.id}`;
  }

  if (tag) {
    return `${permission}:tag:${tag.name}`;
  }

  if (packetGroup) {
    return `${permission}:packetGroup:${packetGroup.name}`;
  }

  return permission;
};
