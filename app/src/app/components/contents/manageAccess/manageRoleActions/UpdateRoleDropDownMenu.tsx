import { useState } from "react";
import { KeyedMutator } from "swr";
import { Button } from "../../../Base/Button";
import { Dialog, DialogClose, DialogFooter } from "../../../Base/Dialog";
import { UpdateDialogContent } from "../UpdateDialogContent";
import { UpdateDropdown, UpdateOptions } from "../UpdateDropdown";
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
  const [selectedOption, setSelectedOption] = useState<UpdateOptions>("permissions");

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <UpdateDropdown manageType="role" setSelectedOption={setSelectedOption} />
      <UpdateDialogContent action={selectedOption} name={role.name}>
        {selectedOption === "users" ? (
          <UpdateRoleUsersForm mutate={mutate} role={role} users={users} setOpen={setDialogOpen} />
        ) : (
          // TODO: Implement UpdateRolePermissionsForm..change to use custom dialog footer
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
