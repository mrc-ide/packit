export interface BasicPacket {
  name: string;
  id: string;
}

export interface BasicPacketGroup {
  name: string;
  id: number;
}
export interface Tag {
  name: string;
  id: number;
}

export interface RolePermission extends BaseRolePermission {
  id: number;
}

export interface BaseRolePermission {
  permission: string;
  packet?: BasicPacket | null;
  tag?: Tag | null;
  packetGroup?: BasicPacketGroup | null;
}

interface BasicUser {
  username: string;
  id: string;
}

export interface RoleWithRelationships {
  name: string;
  rolePermissions: RolePermission[];
  users: BasicUser[];
  id: number;
  isUsername: boolean;
}
