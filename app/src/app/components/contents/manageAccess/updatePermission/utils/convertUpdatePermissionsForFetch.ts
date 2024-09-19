import { BaseRolePermission } from "../../types/Role";

export const convertUpdatePermissionsForFetch = (updatePermissions: {
  addPermissions: BaseRolePermission[];
  removePermissions: BaseRolePermission[];
}) => ({
  addPermissions: updatePermissions.addPermissions.map(convertUpdatePermissionForFetch),
  removePermissions: updatePermissions.removePermissions.map(convertUpdatePermissionForFetch)
});

const convertUpdatePermissionForFetch = (updatePermission: BaseRolePermission) => ({
  permission: updatePermission.permission,
  packetId: updatePermission.packet?.id,
  packetGroupId: updatePermission.packetGroup?.id,
  tagId: updatePermission.tag?.id
});
