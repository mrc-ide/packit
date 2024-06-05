import { z } from "zod";
import { updatePermissionSchema } from "./../UpdatePermissionsForm";
import { isPermissionEqual } from "../../utils/isPermissionEqual";
export const isDuplicateUpdatePermission = (
  currentPermissions: z.infer<typeof updatePermissionSchema>[],
  updatedPermission: z.infer<typeof updatePermissionSchema>
) => currentPermissions.some((currentPermission) => isPermissionEqual(currentPermission, updatedPermission));
