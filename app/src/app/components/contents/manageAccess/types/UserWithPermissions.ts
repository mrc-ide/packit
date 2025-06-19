import { BasicRole, RolePermission } from "./RoleWithRelationships";

export interface UserWithPermissions {
  username: string;
  id: string;
  roles: BasicRole[];
  specificPermissions: RolePermission[];
  email?: string;
  displayName?: string;
}
