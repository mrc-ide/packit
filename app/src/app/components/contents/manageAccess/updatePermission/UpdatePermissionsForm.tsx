import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { KeyedMutator } from "swr";
import { z } from "zod";
import appConfig from "../../../../../config/appConfig";
import { ApiError } from "../../../../../lib/errors";
import { fetcher } from "../../../../../lib/fetch";
import { CustomDialogFooter } from "../../common/CustomDialogFooter";
import { RoleWithRelationships } from "../types/RoleWithRelationships";
import { AddPermissionForUpdateForm } from "./AddPermissionForUpdateForm";
import { RemovePermissionsForUpdate } from "./RemovePermissionsForUpdate";
import { UpdatePermissionScrollArea } from "./UpdatePermissionScrollArea";
import { convertUpdatePermissionsForFetch } from "./utils/convertUpdatePermissionsForFetch";
import { isDuplicateUpdatePermission } from "./utils/isDuplicateUpdatePermission";

interface UpdatePermissionsFormProps {
  role: RoleWithRelationships;
  mutate: KeyedMutator<RoleWithRelationships[]>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const updatePermissionSchema = z.object({
  permission: z.string(),
  packet: z
    .object({
      id: z.string(),
      name: z.string()
    })
    .or(z.null())
    .optional(),
  packetGroup: z
    .object({
      id: z.number(),
      name: z.string()
    })
    .or(z.null())
    .optional(),
  tag: z
    .object({
      id: z.number(),
      name: z.string()
    })
    .or(z.null())
    .optional()
});
export const updatePermissionsFormSchema = z
  .object({
    addPermissions: z.array(updatePermissionSchema),
    removePermissions: z.array(updatePermissionSchema)
  })
  .refine((data) => data.addPermissions.length > 0 || data.removePermissions.length > 0, {
    message: "You must add or remove at least one permission.",
    path: ["addPermissions"]
  });
export const UpdatePermissionsForm = ({ role, mutate, setOpen }: UpdatePermissionsFormProps) => {
  const [fetchError, setFetchError] = useState("");

  const form = useForm<z.infer<typeof updatePermissionsFormSchema>>({
    resolver: zodResolver(updatePermissionsFormSchema),
    defaultValues: {
      addPermissions: [],
      removePermissions: []
    }
  });

  const removePermission = (removePermission: z.infer<typeof updatePermissionSchema>) => {
    const currentRemovePermissions = form.getValues("removePermissions");
    form.setValue("removePermissions", [...currentRemovePermissions, removePermission]);
  };

  const addPermission = (addPermission: z.infer<typeof updatePermissionSchema>) => {
    const currentAddPermissions = form.getValues("addPermissions");
    if (!isDuplicateUpdatePermission(currentAddPermissions, addPermission)) {
      form.setValue("addPermissions", [...currentAddPermissions, addPermission]);
    }
  };

  const onSubmit = async (values: z.infer<typeof updatePermissionsFormSchema>) => {
    try {
      await fetcher({
        url: `${appConfig.apiUrl()}/role/${role.name}/permissions`,
        body: convertUpdatePermissionsForFetch(values),
        method: "PUT"
      });

      form.reset();
      setOpen(false);
      mutate();
    } catch (error) {
      console.error(error);
      if (error instanceof ApiError) {
        return setFetchError(error.message);
      }
      setFetchError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <>
      <AddPermissionForUpdateForm addPermission={addPermission} />
      <UpdatePermissionScrollArea form={form} fieldName="addPermissions" />

      <RemovePermissionsForUpdate
        removePermission={removePermission}
        rolePermissions={role.rolePermissions}
        removedPermissions={form.watch("removePermissions")}
      />
      <UpdatePermissionScrollArea form={form} fieldName="removePermissions" />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {form.formState.errors?.addPermissions && (
          <div className="text-xs text-red-500">{form.formState.errors.addPermissions.message}</div>
        )}
        <CustomDialogFooter error={fetchError} onCancel={() => form.reset()} submitText="Save" />
      </form>
    </>
  );
};
