import { EllipsisVertical } from "lucide-react";
import { useState } from "react";
import { KeyedMutator } from "swr";
import { Button } from "../../../Base/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../../../Base/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../../../Base/DropdownMenu";
import { RoleWithRelationships } from "../types/RoleWithRelationships";
import { UserWithRoles } from "../types/UserWithRoles";
import { UpdateRoleUsersForm } from "./UpdateRoleUsersForm";

interface UpdateRoleDropDownMenuProps {
  role: RoleWithRelationships;
  users: UserWithRoles[];
  mutate: KeyedMutator<RoleWithRelationships[]>;
}
export const UpdateRoleDropDownMenu = ({ mutate, role, users }: UpdateRoleDropDownMenuProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<"users" | "permissions">();

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="edit-role">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DialogTrigger asChild onClick={() => setSelectedOption("users")}>
            <DropdownMenuItem>Update Users</DropdownMenuItem>
          </DialogTrigger>
          <DialogTrigger asChild onClick={() => setSelectedOption("permissions")}>
            <DropdownMenuItem>Update Permissions</DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            Update {selectedOption} on {role.name} role
          </DialogTitle>
        </DialogHeader>
        {selectedOption === "users" ? (
          <UpdateRoleUsersForm mutate={mutate} role={role} users={users} setOpen={setDialogOpen} />
        ) : (
          // TODO: Implement UpdateRolePermissionsForm
          <DialogFooter className="sm:justify-end gap-1">
            {/* {fetchError && <div className="text-xs text-red-500">{fetchError}</div>} */}
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                //    onClick={() => form.reset()}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
