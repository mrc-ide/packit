import { KeyedMutator } from "swr";
import { CustomDialogFooter } from "../../common/CustomDialogFooter";
import { RolePermission, RoleWithRelationships } from "../types/RoleWithRelationships";
import { Dispatch, SetStateAction, useState } from "react";
import { unknown, z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetcher } from "../../../../../lib/fetch";
import appConfig from "../../../../../config/appConfig";
import { ApiError } from "../../../../../lib/errors";
import { Form, FormField, FormItem, FormLabel } from "../../../Base/Form";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger
} from "../../../Base/MultiSelect";
import { constructPermissionName } from "../../../../../lib/constructPermissionName";
import { AddPermissionForUpdateForm, addPermissionFormSchema } from "./AddPermissionForUpdateForm";
import { Badge } from "../../../Base/Badge";
import { cn } from "../../../../../lib/cn";
import { SquarePlus, X } from "lucide-react";
import { ScrollArea } from "../../../Base/ScrollArea";
import { Button } from "../../../Base/Button";
import { RemovePermissionsForUpdate } from "./RemovePermissionsForUpdate";

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

export const UpdatePermissionsForm = ({ role, mutate, setOpen }: UpdatePermissionsFormProps) => {
  const [fetchError, setFetchError] = useState("");

  const formSchema = z.object({
    addPermissions: z.array(updatePermissionSchema),
    removePermissions: z.array(updatePermissionSchema)
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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

  const addPermission = (addPermissionValues: z.infer<typeof addPermissionFormSchema>) => {
    console.log(addPermissionValues);
    // const updatePermission: z.infer<typeof updatePermissionSchema> = {
    //   permission: addPermissionValues.permission
    // };
    // switch (addPermissionValues.scope) {
    //   case "packet":
    //     updatePermission.packetId = addPermissionValues.scopeResource.id;
    //     break;
    //   case "packetGroup":
    //     updatePermission.packetGroupId = addPermissionValues.scopeResource.id;
    //     break;
    //   case "tag":
    //     updatePermission.tagId = addPermissionValues.scopeResource.id;
    //     break;
    // }
    const addPermissionValue: z.infer<typeof updatePermissionSchema> = {
      permission: addPermissionValues.permission,
      ...(addPermissionValues.scope !== "global" && {
        [addPermissionValues.scope]: {
          id:
            addPermissionValues.scope === "packet"
              ? addPermissionValues.scopeResource.id
              : Number(addPermissionValues.scopeResource.id),
          name: addPermissionValues.scopeResource.name
        }
      })
    };
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

    // form.setValue("addPermissions", [
    //   ...form.getValues("addPermissions"),
    //   // TODO: update the construct permission name function
    //   scopedPermissionName
    // ]);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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
      <ScrollArea className="h-20 border rounded-md" type="auto">
        <div className="flex flex-wrap gap-0.5 text-xs px-1 py-2">
          {form.watch("addPermissions").map((addPermission) => {
            const permissionDisplay = constructPermissionName(addPermission as unknown as RolePermission);
            return (
              <Badge
                key={permissionDisplay}
                className={cn("px-1 rounded-xl flex items-center gap-1")}
                variant={"secondary"}
              >
                <span className="text-xs">{permissionDisplay}</span>
                <button
                  aria-label={`Remove ${permissionDisplay} option`}
                  aria-roledescription="button to remove option"
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    form.setValue(
                      "addPermissions",
                      form
                        .getValues("addPermissions")
                        .filter(
                          (permission) =>
                            permissionDisplay !== constructPermissionName(permission as unknown as RolePermission)
                        )
                    );
                  }}
                >
                  <span className="sr-only">Remove {permissionDisplay} option</span>
                  <X className="h-4 w-4 hover:stroke-destructive" />
                </button>
              </Badge>
            );
          })}
        </div>
      </ScrollArea>
      {/* todo: fix delete to extract out info */}
      <RemovePermissionsForUpdate removePermission={removePermission} rolePermissions={role.rolePermissions} />
      <ScrollArea className="h-20 border rounded-md" type="auto">
        <div className="flex flex-wrap gap-0.5 text-xs px-1 py-2">
          {form.watch("removePermissions").map((removePermissions) => {
            const permissionDisplay = constructPermissionName(removePermissions as unknown as RolePermission);
            return (
              <Badge
                key={permissionDisplay}
                className={cn("px-1 rounded-xl flex items-center gap-1")}
                variant={"secondary"}
              >
                <span className="text-xs">{permissionDisplay}</span>
                <button
                  aria-label={`Remove ${permissionDisplay} option`}
                  aria-roledescription="button to remove option"
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    // todo fix this setValue on removal
                    form.setValue(
                      "removePermissions",
                      form
                        .getValues("removePermissions")
                        .filter(
                          (permission) =>
                            permissionDisplay !== constructPermissionName(permission as unknown as RolePermission)
                        )
                    );
                  }}
                >
                  <span className="sr-only">Remove {permissionDisplay} option</span>
                  <X className="h-4 w-4 hover:stroke-destructive" />
                </button>
              </Badge>
            );
          })}
        </div>
      </ScrollArea>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {/* <FormField
            control={form.control}
            name="removePermissions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Permissions to Remove</FormLabel>
                <MultiSelector
                  onValuesChange={(value) => field.onChange(value.map((p) => JSON.parse(p)))}
                  values={field.value.map((p) => JSON.stringify(p))}
                >
                  <MultiSelectorTrigger>
                    <MultiSelectorInput className="text-sm" placeholder="Select Permissions to Remove" />
                  </MultiSelectorTrigger>
                  <MultiSelectorContent>
                    <MultiSelectorList>
                      {role.rolePermissions.map((rolePermission) => {
                        const permissionName = constructPermissionName(rolePermission);
                        const stringPermission = JSON.stringify(rolePermission);
                        return (
                          <MultiSelectorItem key={stringPermission} value={stringPermission}>
                            {permissionName}
                          </MultiSelectorItem>
                        );
                      })}
                    </MultiSelectorList>
                  </MultiSelectorContent>
                </MultiSelector>
              </FormItem>
            )}
          /> */}

          <CustomDialogFooter error={fetchError} onCancel={form.reset} submitText="Save" />
        </form>
      </Form>
    </>
  );
};
