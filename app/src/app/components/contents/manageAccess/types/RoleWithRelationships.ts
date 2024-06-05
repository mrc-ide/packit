interface BasicPacket {
  name: string;
  id: string;
}

interface BasicPacketGroup {
  name: string;
  id: number;
}
interface Tag {
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

export interface UpdateRolePermission {
  permission?: string;
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
