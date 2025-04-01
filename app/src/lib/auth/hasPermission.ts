import { UserState } from "../../app/components/providers/types/UserTypes";
import { buildScopedPermission } from "../constructPermissionName";

export const hasUserManagePermission = (user: UserState | null) => !!user?.authorities.includes("user.manage");

export const hasPacketRunPermission = (user: UserState | null) => !!user?.authorities.includes("packet.run");

export const hasGlobalPacketManagePermission = (user: UserState | null) =>
  !!user?.authorities.includes("packet.manage");

export const hasAnyPacketManagePermission = (user: UserState | null) =>
  !!user?.authorities.find((permission) => permission.startsWith("packet.manage"));

export const canManageAllPackets = (user: UserState | null) =>
  hasUserManagePermission(user) || hasGlobalPacketManagePermission(user);

export const canManagePacketGroup = (user: UserState | null, packetGroupName: string) =>
  canManageAllPackets(user) || !!user?.authorities.includes(buildScopedPermission("packet.manage", packetGroupName));

export const canReadRoles = (user: UserState | null) =>
  hasUserManagePermission(user) || hasAnyPacketManagePermission(user);
