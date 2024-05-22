import { RolePermission } from "./RoleWithRelationships";

export interface UserWithRoles {
  username: string;
  id: string | number;
  roles: { name: string; id: number }[];
  specificPermissions: RolePermission[];
}
