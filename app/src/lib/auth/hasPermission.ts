import { buildScopedPermission } from "../constructPermissionName";

/** Global Permissions */
export const hasUserManagePermission = (authorities: string[] = []) => authorities.includes("user.manage");
export const hasPacketRunPermission = (authorities: string[] = []) => authorities.includes("packet.run");
export const hasGlobalPacketManagePermission = (authorities: string[] = []) => authorities.includes("packet.manage");
export const hasGlobalReadPermission = (authorities: string[] = []) => authorities.includes("packet.read");

/** Manage packets */
export const hasAnyPacketManagePermission = (authorities: string[] = []) =>
  authorities.some((permission) => permission.startsWith("packet.manage"));

export const canManageAllPackets = (authorities: string[] = []) =>
  hasUserManagePermission(authorities) || hasGlobalPacketManagePermission(authorities);

export const hasPacketManagePermissionForGroup = (authorities: string[] = [], packetGroupName: string) =>
  authorities.includes(buildScopedPermission("packet.manage", packetGroupName));

export const canManagePacketGroup = (authorities: string[] = [], packetGroupName: string) =>
  canManageAllPackets(authorities) || hasPacketManagePermissionForGroup(authorities, packetGroupName);

export const hasPacketManagePermissionForPacket = (
  authorities: string[] = [],
  packetGroupName: string,
  packetId: string
) => authorities.includes(buildScopedPermission("packet.manage", packetGroupName, packetId));

export const canManagePacket = (authorities: string[] = [], packetGroupName: string, packetId: string) =>
  canManagePacketGroup(authorities, packetGroupName) ||
  hasPacketManagePermissionForPacket(authorities, packetGroupName, packetId);
