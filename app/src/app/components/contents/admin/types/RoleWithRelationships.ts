import { BasicPacket, BasicPacketGroup, Tag } from "@/types";
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

export interface BasicUser {
  username: string;
  id: string;
}

export interface BasicRole {
  name: string;
  id: number;
}

export interface BasicRoleWithUsers extends BasicRole {
  users: BasicUser[];
}

export interface RoleWithRelationships extends BasicRoleWithUsers {
  rolePermissions: RolePermission[];
  isUsername: boolean;
}

export interface RolesAndUsersWithPermissions {
  roles: RoleWithRelationships[];
  users: UserWithPermissions[];
}

export interface BasicRolesAndUsers {
  roles: BasicRoleWithUsers[];
  users: BasicUser[];
}

export interface RolesAndUsersToUpdateRead {
  cannotRead: BasicRolesAndUsers;
  withRead: BasicRolesAndUsers;
  canRead: BasicRolesAndUsers;
}
