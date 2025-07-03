import { X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { cn } from "@lib/cn";
import { constructPermissionName } from "@lib/constructPermissionName";
import { Badge } from "@components/Base/Badge";
import { ScrollArea } from "@components/Base/ScrollArea";
import { BaseRolePermission } from "../types/RoleWithRelationships";
import { isPermissionEqual } from "../utils/isPermissionEqual";

interface UpdatePermissionScrollAreaProps {
  updatePermissions: BaseRolePermission[];
  updateFieldName: "addPermissions" | "removePermissions";
  setUpdatePermissions: Dispatch<
    SetStateAction<{
      addPermissions: BaseRolePermission[];
      removePermissions: BaseRolePermission[];
    }>
  >;
}
export const UpdatePermissionScrollArea = ({
  updatePermissions,
  updateFieldName,
  setUpdatePermissions
}: UpdatePermissionScrollAreaProps) => {
  return (
    <ScrollArea className="h-20 border rounded-md" type="auto">
      <div className="flex flex-wrap gap-0.5 text-xs px-1 py-2">
        {updatePermissions.map((updatePermission) => {
          const permissionDisplay = constructPermissionName(updatePermission);
          return (
            <Badge
              key={permissionDisplay}
              className={cn("px-1 rounded-xl flex items-center gap-1")}
              variant={"secondary"}
            >
              <span className="text-xs" data-testid={`update-badge-${permissionDisplay}`}>
                {permissionDisplay}
              </span>
              <button
                aria-label={`Remove ${permissionDisplay} option`}
                aria-roledescription="button to remove option"
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setUpdatePermissions((prevUpdatePermissions) => ({
                    ...prevUpdatePermissions,
                    [updateFieldName]: prevUpdatePermissions[updateFieldName].filter(
                      (permission) => !isPermissionEqual(permission, updatePermission)
                    )
                  }));
                }}
              >
                <span className="sr-only">Remove {permissionDisplay} option</span>
                <X className="h-4 w-4 hover:stroke-destructive" />
              </button>
            </Badge>
          );
        })}
      </div>
    </ScrollArea>
  );
};
