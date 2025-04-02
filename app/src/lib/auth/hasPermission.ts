import { UserState } from "../../app/components/providers/types/UserTypes";
import { buildScopedPermission } from "../constructPermissionName";

/** Global Permissions */
export const hasUserManagePermission = (user: UserState | null) => !!user?.authorities.includes("user.manage");
export const hasPacketRunPermission = (user: UserState | null) => !!user?.authorities.includes("packet.run");
export const hasGlobalPacketManagePermission = (user: UserState | null) =>
  !!user?.authorities.includes("packet.manage");
export const hasGlobalReadPermission = (user: UserState | null) => !!user?.authorities.includes("packet.read");

/** Manage packets */
export const hasAnyPacketManagePermission = (user: UserState | null) =>
  !!user?.authorities.find((permission) => permission.startsWith("packet.manage"));

export const canManageAllPackets = (user: UserState | null) =>
  hasUserManagePermission(user) || hasGlobalPacketManagePermission(user);

export const canManagePacketGroup = (user: UserState | null, packetGroupName: string) =>
  canManageAllPackets(user) || !!user?.authorities.includes(buildScopedPermission("packet.manage", packetGroupName));

export const canReadRoles = (user: UserState | null) =>
  hasUserManagePermission(user) || hasAnyPacketManagePermission(user);

/** Read packets */
export const canReadAllPackets = (user: UserState | null) => canManageAllPackets(user) || hasGlobalReadPermission(user);

export const canReadPacketGroup = (user: UserState | null, packetGroupName: string) =>
  canReadAllPackets(user) ||
  canManagePacketGroup(user, packetGroupName) ||
  !!user?.authorities.includes(buildScopedPermission("packet.read", packetGroupName));
