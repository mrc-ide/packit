export const PAGE_SIZE = 50;

// TODO: get this from api and store in AuthConfigProvider
export const GLOBAL_PERMISSIONS = [
  "outpack.read",
  "outpack.write",
  "packet.read",
  "packet.run",
  "user.manage",
  "packet.manage"
] as const;
export const SCOPED_PERMISSIONS: readonly string[] = ["packet.read", "packet.manage"];
export const PERMISSION_SCOPES = ["global", "packet", "tag", "packetGroup"] as const;
export type PermissionScope = (typeof PERMISSION_SCOPES)[number];
