import { X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { cn } from "../../../../../lib/cn";
import { constructPermissionName } from "../../../../../lib/constructPermissionName";
import { Badge } from "../../../Base/Badge";
import { ScrollArea } from "../../../Base/ScrollArea";
import { NewRolePermission, RolePermission } from "../types/RoleWithRelationships";
import { isPermissionEqual } from "../utils/isPermissionEqual";

interface UpdatePermissionScrollAreaProps {
  updatePermissions: NewRolePermission[] | RolePermission[];
  updateFieldName: "addPermissions" | "removePermissions";
  setUpdatePermissions: Dispatch<
    SetStateAction<{
      addPermissions: NewRolePermission[];
      removePermissions: RolePermission[];
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
              <span className="text-xs">{permissionDisplay}</span>
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
