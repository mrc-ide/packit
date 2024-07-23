export const PAGE_SIZE = 50;

export const GLOBAL_PERMISSIONS = [
  "outpack.read",
  "outpack.write",
  "packet.read",
  "packet.run",
  "user.manage"
] as const;

export const PERMISSION_SCOPES = ["global", "packet", "tag", "packetGroup"] as const;
export type PermissionScope = (typeof PERMISSION_SCOPES)[number];
