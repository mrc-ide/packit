import { BasicRole, RolePermission } from "./RoleWithRelationships";

export interface UserWithRoles {
  username: string;
  id: string;
  roles: BasicRole[];
  specificPermissions: RolePermission[];
}
