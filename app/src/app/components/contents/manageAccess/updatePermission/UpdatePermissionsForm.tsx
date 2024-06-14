import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { KeyedMutator } from "swr";
import appConfig from "../../../../../config/appConfig";
import { ApiError } from "../../../../../lib/errors";
import { fetcher } from "../../../../../lib/fetch";
import { CustomDialogFooter } from "../../common/CustomDialogFooter";
import { BaseRolePermission, RolePermission, RoleWithRelationships } from "../types/RoleWithRelationships";
import { AddPermissionForUpdateForm } from "./AddPermissionForUpdateForm";
import { RemovePermissionsForUpdate } from "./RemovePermissionsForUpdate";
import { UpdatePermissionScrollArea } from "./UpdatePermissionScrollArea";
import { convertUpdatePermissionsForFetch } from "./utils/convertUpdatePermissionsForFetch";
import { Separator } from "../../../Base/Separator";

interface UpdatePermissionsFormProps {
  roleName: string;
  rolePermissions: RolePermission[];
  mutate: KeyedMutator<RoleWithRelationships[]>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const UpdatePermissionsForm = ({ roleName, rolePermissions, mutate, setOpen }: UpdatePermissionsFormProps) => {
  const [error, setError] = useState("");
  const [updatePermissions, setUpdatePermissions] = useState<{
    addPermissions: BaseRolePermission[];
    removePermissions: BaseRolePermission[];
  }>({ addPermissions: [], removePermissions: [] });

  const removePermission = (removePermission: BaseRolePermission) => {
    setUpdatePermissions((prevUpdatePermissions) => ({
      ...prevUpdatePermissions,
      removePermissions: [...prevUpdatePermissions.removePermissions, removePermission]
    }));
  };

  const addPermission = (addPermission: BaseRolePermission) => {
    setUpdatePermissions((prevUpdatePermissions) => ({
      ...prevUpdatePermissions,
      addPermissions: [...prevUpdatePermissions.addPermissions, addPermission]
    }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (updatePermissions.addPermissions.length === 0 && updatePermissions.removePermissions.length === 0) {
      return setError("You must add or remove at least one permission.");
    }
    try {
      await fetcher({
        url: `${appConfig.apiUrl()}/role/${roleName}/permissions`,
        body: convertUpdatePermissionsForFetch(updatePermissions),
        method: "PUT"
      });

      setUpdatePermissions({
        addPermissions: [],
        removePermissions: []
      });
      setOpen(false);
      mutate();
    } catch (error) {
      console.error(error);
      if (error instanceof ApiError) {
        return setError(error.message);
      }
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <>
      <AddPermissionForUpdateForm
        addPermission={addPermission}
        currentPermissions={[...updatePermissions.addPermissions, ...rolePermissions]}
      />
      <UpdatePermissionScrollArea
        updateFieldName="addPermissions"
        updatePermissions={updatePermissions.addPermissions}
        setUpdatePermissions={setUpdatePermissions}
      />
      <Separator />
      <RemovePermissionsForUpdate
        removePermission={removePermission}
        rolePermissions={rolePermissions}
        removedPermissions={updatePermissions.removePermissions}
      />
      <UpdatePermissionScrollArea
        updateFieldName="removePermissions"
        updatePermissions={updatePermissions.removePermissions}
        setUpdatePermissions={setUpdatePermissions}
      />
      <form onSubmit={onSubmit} className="space-y-3">
        {error && <div className="text-xs text-red-500">{error}</div>}
        <CustomDialogFooter
          onCancel={() => setUpdatePermissions({ addPermissions: [], removePermissions: [] })}
          submitText="Save"
        />
      </form>
    </>
  );
};
