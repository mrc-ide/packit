import { Check, ChevronsUpDown, SquarePlus } from "lucide-react";
import React, { useState } from "react";
import { cn } from "../../../../../lib/cn";
import { constructPermissionName } from "../../../../../lib/constructPermissionName";
import { Button } from "../../../Base/Button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../../Base/Command";
import { Label } from "../../../Base/Label";
import { Popover, PopoverContent, PopoverTrigger } from "../../../Base/Popover";
import { RolePermission } from "../types/RoleWithRelationships";

interface RemovePermissionsForUpdateProps {
  removePermission: (value: RolePermission) => void;
  rolePermissions: RolePermission[];
}
export const RemovePermissionsForUpdate = ({ removePermission, rolePermissions }: RemovePermissionsForUpdateProps) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = useState<RolePermission>();

  const constructFoundRolePermission = (rolePermission: RolePermission) => {
    const foundRolePermission = rolePermissions.find(
      (rolePermision) => constructPermissionName(rolePermision) === constructPermissionName(rolePermission)
    );
    if (!foundRolePermission) return;
    return constructPermissionName(foundRolePermission);
  };
  return (
    <>
      <Label>Permissions To Remove</Label>
      <div className="flex space-x-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-[350px] justify-between">
              {value ? constructFoundRolePermission(value) : "Select Permission..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[350px] p-0">
            <Command>
              <CommandInput placeholder="Search permission..." />
              <CommandList>
                <CommandEmpty>No permissions found.</CommandEmpty>
                <CommandGroup>
                  {rolePermissions.map((rolePermission) => (
                    <CommandItem
                      key={rolePermission.id}
                      value={rolePermission.id.toString()}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value?.id.toString() ? undefined : rolePermission);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn("mr-2 h-4 w-4", value?.id === rolePermission.id ? "opacity-100" : "opacity-0")}
                      />
                      {constructPermissionName(rolePermission)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button
          variant="outline"
          size="icon"
          disabled={value?.permission === undefined}
          onClick={() => removePermission(value as RolePermission)}
        >
          <SquarePlus className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};
