import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { KeyedMutator } from "swr";
import { z } from "zod";
import appConfig from "../../../../../config/appConfig";
import { ApiError } from "../../../../../lib/errors";
import { fetcher } from "../../../../../lib/fetch";
import { Form, FormField, FormItem, FormLabel } from "../../../Base/Form";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger
} from "../../../Base/MultiSelect";
import { CustomDialogFooter } from "../../common/CustomDialogFooter";
import { RoleWithRelationships } from "../types/RoleWithRelationships";
import { UserWithRoles } from "../types/UserWithRoles";

interface UpdateUserRoleFormProps {
  mutate: KeyedMutator<RoleWithRelationships[]>;
  user: UserWithRoles;
  roles: RoleWithRelationships[];
  setOpen: Dispatch<SetStateAction<boolean>>;
}
export const UpdateUserRoleForm = ({ mutate, user, roles, setOpen }: UpdateUserRoleFormProps) => {
  const [fetchError, setFetchError] = useState("");
  const rolesNotInUser = roles.filter((role) => !user.roles.find((r) => r.name === role.name));

  const formSchema = z.object({
    roleNamesToAdd: z.array(z.string()),
    roleNamesToRemove: z.array(z.string())
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roleNamesToAdd: [],
      roleNamesToRemove: []
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetcher({
        url: `${appConfig.apiUrl()}/user/${user.username}/roles`,
        body: values,
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="roleNamesToAdd"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Roles to Add</FormLabel>
              <MultiSelector onValuesChange={field.onChange} values={field.value}>
                <MultiSelectorTrigger>
                  <MultiSelectorInput className="text-sm" placeholder="Select Roles to Add" />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                  <MultiSelectorList>
                    {rolesNotInUser.map((role) => (
                      <MultiSelectorItem key={role.id} value={role.name}>
                        {role.name}
                      </MultiSelectorItem>
                    ))}
                  </MultiSelectorList>
                </MultiSelectorContent>
              </MultiSelector>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="roleNamesToRemove"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Users to Remove</FormLabel>
              <MultiSelector onValuesChange={field.onChange} values={field.value}>
                <MultiSelectorTrigger>
                  <MultiSelectorInput className="text-sm" placeholder="Select Usernames to Remove" />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                  <MultiSelectorList>
                    {user.roles.map((role) => (
                      <MultiSelectorItem key={role.id} value={role.name}>
                        {role.name}
                      </MultiSelectorItem>
                    ))}
                  </MultiSelectorList>
                </MultiSelectorContent>
              </MultiSelector>
            </FormItem>
          )}
        />
        <CustomDialogFooter error={fetchError} onCancel={form.reset} submitText="Save" />
      </form>
    </Form>
  );
};
