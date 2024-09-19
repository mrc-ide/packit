import { useState } from "react";
import { KeyedMutator } from "swr";
import { Dialog } from "../../../Base/Dialog";
import { UpdateDialogContent } from "../UpdateDialogContent";
import { UpdateDropdown, UpdateOptions } from "../UpdateDropdown";
import { UpdatePermissionsForm } from "../updatePermission/UpdatePermissionsForm";
import { Role } from "../types/Role";
import { User } from "../types/User";
import { UpdateRoleUsersForm } from "./UpdateRoleUsersForm";

interface UpdateRoleDropDownMenuProps {
  role: Role;
  users: User[];
  mutate: KeyedMutator<never>;
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
          <UpdatePermissionsForm
            roleName={role.name}
            rolePermissions={role.rolePermissions}
            mutate={mutate}
            setOpen={setDialogOpen}
          />
        )}
      </UpdateDialogContent>
    </Dialog>
  );
};
