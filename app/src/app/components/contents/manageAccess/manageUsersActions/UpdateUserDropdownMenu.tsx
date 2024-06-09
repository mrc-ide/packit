import { useState } from "react";
import { KeyedMutator } from "swr";
import { Button } from "../../../Base/Button";
import { Dialog, DialogClose, DialogFooter } from "../../../Base/Dialog";
import { UpdateDialogContent } from "../UpdateDialogContent";
import { UpdateDropdown, UpdateOptions } from "../UpdateDropdown";
import { RoleWithRelationships } from "../types/RoleWithRelationships";
import { UserWithRoles } from "../types/UserWithRoles";
import { UpdateUserRoleForm } from "./UpdateUserRoleForm";

interface UpdateUserDropdownMenuProps {
  user: UserWithRoles;
  roles: RoleWithRelationships[];
  mutate: KeyedMutator<RoleWithRelationships[]>;
}
export const UpdateUserDropdownMenu = ({ user, roles, mutate }: UpdateUserDropdownMenuProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<UpdateOptions>("permissions");
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <UpdateDropdown manageType="user" setSelectedOption={setSelectedOption} />
      <UpdateDialogContent action={selectedOption} name={user.username}>
        {selectedOption === "roles" ? (
          <UpdateUserRoleForm mutate={mutate} user={user} roles={roles} setOpen={setDialogOpen} />
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
      </UpdateDialogContent>
    </Dialog>
  );
};
