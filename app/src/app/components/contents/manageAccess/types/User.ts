import { RolePermission } from "./Role";

interface BasicRole {
  name: string;
  id: string;
}

export interface User {
  username: string;
  id: string | number;
  roles: BasicRole[];
  specificPermissions: RolePermission[];
}
