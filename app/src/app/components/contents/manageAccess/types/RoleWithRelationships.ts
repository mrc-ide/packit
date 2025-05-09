import { BasicPacket, BasicPacketGroup, Tag } from "../../../../../types";
import { UserWithPermissions } from "./UserWithPermissions";

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

export interface BasicRole {
  name: string;
  id: number;
}

export interface RoleWithRelationships {
  name: string;
  rolePermissions: RolePermission[];
  users: BasicUser[];
  id: number;
  isUsername: boolean;
}

export interface RolesAndUsersWithPermissions {
  roles: RoleWithRelationships[];
  users: UserWithPermissions[];
}

export interface RolesAndUsersToUpdateRead {
  cantRead: RolesAndUsersWithPermissions;
  withRead: RolesAndUsersWithPermissions;
}

export interface RolesAndUsersToUpdatePacketRead extends RolesAndUsersToUpdateRead {
  canRead: RolesAndUsersWithPermissions;
}
