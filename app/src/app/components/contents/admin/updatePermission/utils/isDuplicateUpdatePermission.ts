import { BaseRolePermission } from "../../types/RoleWithRelationships";
import { isPermissionEqual } from "../../utils/isPermissionEqual";
export const isDuplicateUpdatePermission = (
  currentPermissions: BaseRolePermission[],
  updatedPermission: BaseRolePermission
) => currentPermissions.some((currentPermission) => isPermissionEqual(currentPermission, updatedPermission));
