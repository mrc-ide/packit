import { BaseRolePermission } from "../types/Role";

export const isPermissionEqual = (permission1: BaseRolePermission, permission2: BaseRolePermission): boolean =>
  permission1.permission === permission2.permission &&
  permission1.packet?.id === permission2.packet?.id &&
  permission1.tag?.id === permission2.tag?.id &&
  permission1.packetGroup?.id === permission2.packetGroup?.id;
