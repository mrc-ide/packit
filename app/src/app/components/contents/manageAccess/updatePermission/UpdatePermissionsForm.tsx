import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { KeyedMutator } from "swr";
import { z } from "zod";
import appConfig from "../../../../../config/appConfig";
import { cn } from "../../../../../lib/cn";
import { constructPermissionName } from "../../../../../lib/constructPermissionName";
import { ApiError } from "../../../../../lib/errors";
import { fetcher } from "../../../../../lib/fetch";
import { Badge } from "../../../Base/Badge";
import { ScrollArea } from "../../../Base/ScrollArea";
import { CustomDialogFooter } from "../../common/CustomDialogFooter";
import { RolePermission, RoleWithRelationships } from "../types/RoleWithRelationships";
import { AddPermissionForUpdateForm } from "./AddPermissionForUpdateForm";
import { RemovePermissionsForUpdate } from "./RemovePermissionsForUpdate";
import { UpdatePermissionScrollArea } from "./UpdatePermissionScrollArea";

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
    .optional(),
  packetGroup: z
    .object({
      id: z.number(),
      name: z.string()
    })
    .optional(),
  tag: z
    .object({
      id: z.number(),
      name: z.string()
    })
    .optional()
});
export const updatePermissionsFormSchema = z.object({
  addPermissions: z.array(updatePermissionSchema),
  removePermissions: z.array(updatePermissionSchema)
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

  const removePermission = (removePermissionValues: RolePermission) => {
    const currentRemovePermissions = form.getValues("removePermissions");
    if (
      !currentRemovePermissions.some(
        (permission) =>
          permission.permission === removePermissionValues.permission &&
          permission.packet?.id === removePermissionValues.packet?.id &&
          permission.tag?.id === removePermissionValues.tag?.id &&
          permission.packetGroup?.id === removePermissionValues.packetGroup?.id
      )
    ) {
      form.setValue("removePermissions", [
        ...form.getValues("removePermissions"),
        {
          permission: removePermissionValues.permission,
          ...(removePermissionValues.packet && { packet: removePermissionValues.packet }),
          ...(removePermissionValues.tag && { tag: removePermissionValues.tag }),
          ...(removePermissionValues.packetGroup && { packetGroup: removePermissionValues.packetGroup })
        }
      ]);
    }
  };

  const addPermission = (addPermissionValue: z.infer<typeof updatePermissionSchema>) => {
    const currentAddPermissions = form.getValues("addPermissions");
    if (
      !currentAddPermissions.some(
        (permission) =>
          permission.permission === addPermissionValue.permission &&
          permission.packet?.id === addPermissionValue.packet?.id &&
          permission.tag?.id === addPermissionValue.tag?.id &&
          permission.packetGroup?.id === addPermissionValue.packetGroup?.id
      )
    ) {
      form.setValue("addPermissions", [...form.getValues("addPermissions"), addPermissionValue]);
    }
    // TODO: fix up types and id types
  };

  const onSubmit = async (values: z.infer<typeof updatePermissionsFormSchema>) => {
    console.log(values);
    const updatedPermissions = {
      addPermissions: values.addPermissions.map((p) => ({
        permission: p.permission,
        packetId: p.packet?.id,
        packetGroupId: p.packetGroup?.id,
        tagId: p.tag?.id
      })),
      removePermissions: values.removePermissions.map((p) => ({
        permission: p.permission,
        packetId: p.packet?.id,
        packetGroupId: p.packetGroup?.id,
        tagId: p.tag?.id
      }))
    };
    try {
      await fetcher({
        url: `${appConfig.apiUrl()}/role/${role.name}/permissions`,
        body: updatedPermissions,
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

      <RemovePermissionsForUpdate removePermission={removePermission} rolePermissions={role.rolePermissions} />
      <UpdatePermissionScrollArea form={form} fieldName="removePermissions" />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <CustomDialogFooter error={fetchError} onCancel={() => form.reset()} submitText="Save" />
      </form>
    </>
  );
};
