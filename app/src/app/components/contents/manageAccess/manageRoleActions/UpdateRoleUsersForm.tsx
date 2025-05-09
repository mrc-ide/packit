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
import { UserWithPermissions } from "../types/UserWithPermissions";

interface UpdateRoleUsersFormProps {
  role: RoleWithRelationships;
  users: UserWithPermissions[];
  mutate: KeyedMutator<RoleWithRelationships[]>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}
export const UpdateRoleUsersForm = ({ role, users, mutate, setOpen }: UpdateRoleUsersFormProps) => {
  const [fetchError, setFetchError] = useState("");
  const usersNotInRole = users.filter((user) => !role.users.find((u) => u.username === user.username));

  const formSchema = z.object({
    usernamesToAdd: z.array(z.string()),
    usernamesToRemove: z.array(z.string())
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usernamesToAdd: [],
      usernamesToRemove: []
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetcher({
        url: `${appConfig.apiUrl()}/roles/${role.name}/users`,
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
          name="usernamesToAdd"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Users to Add</FormLabel>
              <MultiSelector onValuesChange={field.onChange} values={field.value}>
                <MultiSelectorTrigger>
                  <MultiSelectorInput className="text-sm" placeholder="Select Usernames to Add" />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                  <MultiSelectorList>
                    {usersNotInRole.map((user) => (
                      <MultiSelectorItem key={user.id} value={user.username}>
                        {user.username}
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
          name="usernamesToRemove"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Users to Remove</FormLabel>
              <MultiSelector onValuesChange={field.onChange} values={field.value}>
                <MultiSelectorTrigger>
                  <MultiSelectorInput className="text-sm" placeholder="Select Usernames to Remove" />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                  <MultiSelectorList>
                    {role.users.map((user) => (
                      <MultiSelectorItem key={user.id} value={user.username}>
                        {user.username}
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
