import { ChevronsUpDown } from "lucide-react";
import React from "react";
import { constructPermissionName } from "../../../../../lib/constructPermissionName";
import { Button } from "../../../Base/Button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../../Base/Command";
import { Label } from "../../../Base/Label";
import { Popover, PopoverContent, PopoverTrigger } from "../../../Base/Popover";
import { BaseRolePermission, RolePermission } from "../types/RoleWithRelationships";
import { isDuplicateUpdatePermission } from "./utils/isDuplicateUpdatePermission";

interface RemovePermissionsForUpdateProps {
  removedPermissions: BaseRolePermission[];
  removePermission: (value: BaseRolePermission) => void;
  rolePermissions: RolePermission[];
}
export const RemovePermissionsForUpdate = ({
  removedPermissions,
  removePermission,
  rolePermissions
}: RemovePermissionsForUpdateProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Label className="font-semibold">Permissions To Remove</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-[400px] justify-between">
            Select Permission...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Search permission..." />
            <CommandList>
              <CommandEmpty>No permissions found.</CommandEmpty>
              <CommandGroup>
                {rolePermissions.map((rolePermission) => {
                  const displayPermission = constructPermissionName(rolePermission);
                  return (
                    <CommandItem
                      key={rolePermission.id}
                      value={displayPermission}
                      onSelect={() => {
                        removePermission(rolePermission);
                        setOpen(false);
                      }}
                      disabled={isDuplicateUpdatePermission(removedPermissions, rolePermission)}
                    >
                      {displayPermission}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
};
