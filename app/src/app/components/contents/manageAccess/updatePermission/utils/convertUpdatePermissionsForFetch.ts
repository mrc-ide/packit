import { NewRolePermission, RolePermission } from "../../types/RoleWithRelationships";

export const convertUpdatePermissionsForFetch = (updatePermissions: {
  addPermissions: NewRolePermission[];
  removePermissions: RolePermission[];
}) => ({
  addPermissions: updatePermissions.addPermissions.map(convertUpdatePermissionForFetch),
  removePermissions: updatePermissions.removePermissions.map(convertUpdatePermissionForFetch)
});

const convertUpdatePermissionForFetch = (updatePermission: RolePermission | NewRolePermission) => ({
  permission: updatePermission.permission,
  packetId: updatePermission.packet?.id,
  packetGroupId: updatePermission.packetGroup?.id,
  tagId: updatePermission.tag?.id
});
