import { useState } from "react";
import { KeyedMutator } from "swr";
import { Dialog } from "@components/Base/Dialog";
import { UpdateDialogContent } from "../UpdateDialogContent";
import { UpdateDropdown, UpdateOptions } from "../UpdateDropdown";
import { RoleWithRelationships } from "../types/RoleWithRelationships";
import { UserWithPermissions } from "../types/UserWithPermissions";
import { UpdatePermissionsForm } from "../updatePermission/UpdatePermissionsForm";
import { UpdateUserRoleForm } from "./UpdateUserRoleForm";

interface UpdateUserDropdownMenuProps {
  user: UserWithPermissions;
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
          <UpdatePermissionsForm
            roleName={user.username}
            rolePermissions={user.specificPermissions}
            mutate={mutate}
            setOpen={setDialogOpen}
          />
        )}
      </UpdateDialogContent>
    </Dialog>
  );
};
