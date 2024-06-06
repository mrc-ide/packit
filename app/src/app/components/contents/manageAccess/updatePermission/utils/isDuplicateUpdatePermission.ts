import { NewRolePermission, RolePermission } from "../../types/RoleWithRelationships";
import { isPermissionEqual } from "../../utils/isPermissionEqual";
export const isDuplicateUpdatePermission = (
  currentPermissions: NewRolePermission[] | RolePermission[],
  updatedPermission: NewRolePermission | RolePermission
) => currentPermissions.some((currentPermission) => isPermissionEqual(currentPermission, updatedPermission));
