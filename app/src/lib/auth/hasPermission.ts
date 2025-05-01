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

export const canReadRoles = (authorities: string[] = []) =>
  hasUserManagePermission(authorities) || hasAnyPacketManagePermission(authorities);

export const hasPacketManagePermissionForPacket = (
  authorities: string[] = [],
  packetGroupName: string,
  packetId: string
) => authorities.includes(buildScopedPermission("packet.manage", packetGroupName, packetId));

export const canManagePacket = (authorities: string[] = [], packetGroupName: string, packetId: string) =>
  canManagePacketGroup(authorities, packetGroupName) ||
  hasPacketManagePermissionForPacket(authorities, packetGroupName, packetId);

/** Read packets */
export const canReadAllPackets = (authorities: string[] = []) =>
  canManageAllPackets(authorities) || hasGlobalReadPermission(authorities);

export const hasPacketReadPermissionForGroup = (authorities: string[] = [], packetGroupName: string) =>
  authorities.includes(buildScopedPermission("packet.read", packetGroupName));

export const canReadPacketGroup = (authorities: string[] = [], packetGroupName: string) =>
  canReadAllPackets(authorities) ||
  canManagePacketGroup(authorities, packetGroupName) ||
  hasPacketReadPermissionForGroup(authorities, packetGroupName);

export const hasPacketReadPermissionForPacket = (
  authorities: string[] = [],
  packetGroupName: string,
  packetId: string
) => authorities.includes(buildScopedPermission("packet.read", packetGroupName, packetId));

export const canReadPacket = (authorities: string[] = [], packetGroup: string, packetId: string) =>
  canReadPacketGroup(authorities, packetGroup) ||
  canManagePacket(authorities, packetGroup, packetId) ||
  hasPacketReadPermissionForPacket(authorities, packetGroup, packetId);
