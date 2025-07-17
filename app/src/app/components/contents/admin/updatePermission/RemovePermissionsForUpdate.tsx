import { ChevronsUpDown } from "lucide-react";
import { constructPermissionName } from "@lib/constructPermissionName";
import { Button } from "@components/Base/Button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@components/Base/Command";
import { Label } from "@components/Base/Label";
import { Popover, PopoverContent, PopoverTrigger } from "@components/Base/Popover";
import { BaseRolePermission, RolePermission } from "../types/RoleWithRelationships";
import { isDuplicateUpdatePermission } from "./utils/isDuplicateUpdatePermission";
import { useState } from "react";

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
  const [open, setOpen] = useState(false);

  return (
    <>
      <Label className="font-semibold">Permissions to remove</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[400px] justify-between hover:bg-background hover:text-inherit"
          >
            Select permission...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Search permissions..." />
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
