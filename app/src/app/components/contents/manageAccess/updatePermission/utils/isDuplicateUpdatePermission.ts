import { BaseRolePermission } from "../../types/Role";
import { isPermissionEqual } from "../../utils/isPermissionEqual";
export const isDuplicateUpdatePermission = (
  currentPermissions: BaseRolePermission[],
  updatedPermission: BaseRolePermission
) => currentPermissions.some((currentPermission) => isPermissionEqual(currentPermission, updatedPermission));
