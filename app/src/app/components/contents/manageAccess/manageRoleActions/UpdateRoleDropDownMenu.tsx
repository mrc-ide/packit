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
import { UpdateUsers } from "./UpdateUsers";

interface UpdateRoleDropDownMenuProps {
  role: RoleWithRelationships;
  users: UserWithRoles[];
  mutate: KeyedMutator<RoleWithRelationships[]>;
}
export const UpdateRoleDropDownMenu = ({ mutate, role, users }: UpdateRoleDropDownMenuProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialog, setDialog] = useState<"user" | "permission">("user");

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
          <DialogTrigger asChild onClick={() => setDialog("user")}>
            <DropdownMenuItem>Update Users</DropdownMenuItem>
          </DialogTrigger>
          <DialogTrigger asChild onClick={() => setDialog("permission")}>
            <DropdownMenuItem>Update Permissions</DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      {dialog === "user" ? (
        <UpdateUsers mutate={mutate} role={role} users={users} setOpen={setDialogOpen} />
      ) : (
        // TODO
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Permissions on {role.name} role</DialogTitle>
          </DialogHeader>
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
        </DialogContent>
      )}
    </Dialog>
  );
};
