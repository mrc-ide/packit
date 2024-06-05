import { z } from "zod";
import { updatePermissionSchema, updatePermissionsFormSchema } from "../UpdatePermissionsForm";

export const convertUpdatePermissionsForFetch = (updatePermissions: z.infer<typeof updatePermissionsFormSchema>) => ({
  addPermissions: updatePermissions.addPermissions.map(convertUpdatePermissionForFetch),
  removePermissions: updatePermissions.removePermissions.map(convertUpdatePermissionForFetch)
});

const convertUpdatePermissionForFetch = (updatePermission: z.infer<typeof updatePermissionSchema>) => ({
  permission: updatePermission.permission,
  packetId: updatePermission.packet?.id,
  packetGroupId: updatePermission.packetGroup?.id,
  tagId: updatePermission.tag?.id
});
