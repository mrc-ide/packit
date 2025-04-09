import { BaseRolePermission } from "../app/components/contents/manageAccess/types/RoleWithRelationships";

export const mapPermissionsToNames = (rolePermissions: BaseRolePermission[] = []) =>
  rolePermissions.map((permission) => constructPermissionName(permission));

export const constructPermissionName = ({ permission, packet, tag, packetGroup }: BaseRolePermission) => {
  const packetGroupName = packet?.name ?? packetGroup?.name;
  return buildScopedPermission(permission, packetGroupName, packet?.id, tag?.name);
};

export const buildScopedPermission = (
  permission: string,
  packetGroupName?: string,
  packetId?: string,
  tag?: string
): string => {
  validateScopedPermissionArgs(packetGroupName, packetId, tag);

  if (packetId && packetGroupName) {
    return `${permission}:packet:${packetGroupName}:${packetId}`;
  }
  if (packetGroupName) {
    return `${permission}:packetGroup:${packetGroupName}`;
  }
  if (tag) {
    return `${permission}:tag:${tag}`;
  }

  return permission;
};

const validateScopedPermissionArgs = (packetGroupName?: string, packetId?: string, tag?: string) => {
  if (tag && (packetGroupName || packetId)) {
    throw new Error("tag cannot be provided with packetGroupName or packetId");
  }
  if (packetId && !packetGroupName) {
    throw new Error("packetGroupName must be provided if packetId is given");
  }
};
