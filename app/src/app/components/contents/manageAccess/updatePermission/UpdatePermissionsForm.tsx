import { KeyedMutator } from "swr";
import { CustomDialogFooter } from "../../common/CustomDialogFooter";
import { RoleWithRelationships } from "../types/RoleWithRelationships";
import { Dispatch, SetStateAction, useState } from "react";
import { z } from "zod";
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
import { AddPermissionForUpdateForm } from "./AddPermissionForUpdateForm";

interface UpdatePermissionsFormProps {
  role: RoleWithRelationships;
  mutate: KeyedMutator<RoleWithRelationships[]>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const UpdatePermissionsForm = ({ role, mutate, setOpen }: UpdatePermissionsFormProps) => {
  const [fetchError, setFetchError] = useState("");

  const formSchema = z.object({
    addPermissions: z.array(z.string()),
    removePermissions: z.array(z.string())
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      addPermissions: [],
      removePermissions: []
    }
  });

  const addPermission = (permission: string, packetId?: string, packetGroupId?: number, tagId?: number) => {
    form.setValue("addPermissions", [
      ...form.getValues("addPermissions"),
      // TODO: update the construct permission name function
      permission +
        (packetId ? `:${packetId}` : "") +
        (packetGroupId ? `:${packetGroupId}` : "") +
        (tagId ? `:${tagId}` : "")
    ]);
  };
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);

    // TODO: transform values into the correct format from strings
    const transformedValues = { addPermissions: [], removePermissions: [] };
    // try {
    //   await fetcher({
    //     url: `${appConfig.apiUrl()}/role/${role.name}/permissions`,
    //     body: transformedValues,
    //     method: "PUT"
    //   });

    //   form.reset();
    //   setOpen(false);
    //   mutate();
    // } catch (error) {
    //   console.error(error);
    //   if (error instanceof ApiError) {
    //     return setFetchError(error.message);
    //   }
    //   setFetchError("An unexpected error occurred. Please try again.");
    // }
  };

  return (
    <>
      <AddPermissionForUpdateForm addPermission={addPermission} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="removePermissions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Permissions to Remove</FormLabel>
                <MultiSelector onValuesChange={field.onChange} values={field.value}>
                  <MultiSelectorTrigger>
                    <MultiSelectorInput className="text-sm" placeholder="Select Permissions to Remove" />
                  </MultiSelectorTrigger>
                  <MultiSelectorContent>
                    <MultiSelectorList>
                      {role.rolePermissions.map((rolePermission) => {
                        const permissionName = constructPermissionName(rolePermission);
                        return (
                          <MultiSelectorItem key={rolePermission.id} value={permissionName}>
                            {permissionName}
                          </MultiSelectorItem>
                        );
                      })}
                    </MultiSelectorList>
                  </MultiSelectorContent>
                </MultiSelector>
              </FormItem>
            )}
          />
          <CustomDialogFooter error={fetchError} onCancel={form.reset} submitText="Save" />
        </form>
      </Form>
    </>
  );
};
