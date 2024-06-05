import { X } from "lucide-react";
import { cn } from "../../../../../lib/cn";
import { constructPermissionName } from "../../../../../lib/constructPermissionName";
import { Badge } from "../../../Base/Badge";
import { ScrollArea } from "../../../Base/ScrollArea";
import { RolePermission } from "../types/RoleWithRelationships";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { updatePermissionsFormSchema } from "./UpdatePermissionsForm";

interface UpdatePermissionScrollAreaProps {
  form: UseFormReturn<z.infer<typeof updatePermissionsFormSchema>>;
  fieldName: keyof z.infer<typeof updatePermissionsFormSchema>;
}
export const UpdatePermissionScrollArea = ({ form, fieldName }: UpdatePermissionScrollAreaProps) => {
  return (
    <ScrollArea className="h-20 border rounded-md" type="auto">
      <div className="flex flex-wrap gap-0.5 text-xs px-1 py-2">
        {form.watch(fieldName).map((permission) => {
          const permissionDisplay = constructPermissionName(permission as unknown as RolePermission);
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
                  form.setValue(
                    fieldName,
                    form
                      .getValues(fieldName)
                      .filter(
                        (permission) =>
                          permissionDisplay !== constructPermissionName(permission as unknown as RolePermission)
                      )
                  );
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
