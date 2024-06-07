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

export interface RolePermission {
  permission: string;
  packet: BasicPacket | null;
  tag: Tag | null;
  packetGroup: BasicPacketGroup | null;
  id: number;
}

export interface NewRolePermission {
  permission: string;
  packet?: BasicPacket | null;
  tag?: Tag | null;
  packetGroup?: BasicPacketGroup | null;
  id?: number;
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
