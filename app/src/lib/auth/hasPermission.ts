import { buildScopedPermission } from "../constructPermissionName";

/** Global Permissions */
export const hasUserManagePermission = (authorities: string[] = []) => authorities.includes("user.manage");
export const hasPacketRunPermission = (authorities: string[] = []) => authorities.includes("packet.run");
export const hasGlobalPacketManagePermission = (authorities: string[] = []) => authorities.includes("packet.manage");
export const hasGlobalReadPermission = (authorities: string[] = []) => authorities.includes("packet.read");

/** Manage packets */
export const hasAnyPacketManagePermission = (authorities: string[] = []) =>
  authorities.find((permission) => permission.startsWith("packet.manage"));

export const canManageAllPackets = (authorities: string[] = []) =>
  hasUserManagePermission(authorities) || hasGlobalPacketManagePermission(authorities);

export const canManagePacketGroup = (authorities: string[] = [], packetGroupName: string) =>
  canManageAllPackets(authorities) || !!authorities.includes(buildScopedPermission("packet.manage", packetGroupName));

export const canReadRoles = (authorities: string[] = []) =>
  hasUserManagePermission(authorities) || hasAnyPacketManagePermission(authorities);

/** Read packets */
export const canReadAllPackets = (authorities: string[] = []) =>
  canManageAllPackets(authorities) || hasGlobalReadPermission(authorities);

export const hasPacketReadPermissionForGroup = (authorities: string[] = [], packetGroupName: string) =>
  authorities.includes(buildScopedPermission("packet.read", packetGroupName));

export const canReadPacketGroup = (authorities: string[] = [], packetGroupName: string) =>
  canReadAllPackets(authorities) ||
  canManagePacketGroup(authorities, packetGroupName) ||
  hasPacketReadPermissionForGroup(authorities, packetGroupName);
