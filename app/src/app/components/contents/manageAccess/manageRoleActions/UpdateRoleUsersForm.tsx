import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { KeyedMutator } from "swr";
import { z } from "zod";
import appConfig from "../../../../../config/appConfig";
import { ApiError } from "../../../../../lib/errors";
import { fetcher } from "../../../../../lib/fetch";
import { Button } from "../../../Base/Button";
import { DialogClose, DialogFooter } from "../../../Base/Dialog";
import { Form, FormField, FormItem, FormLabel } from "../../../Base/Form";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger
} from "../../../Base/MultiSelect";
import { RoleWithRelationships } from "../types/RoleWithRelationships";
import { UserWithRoles } from "../types/UserWithRoles";

interface UpdateRoleUsersFormProps {
  role: RoleWithRelationships;
  users: UserWithRoles[];
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
        url: `${appConfig.apiUrl()}/role/${role.name}/users`,
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
              <FormLabel>User&apos;s to Add</FormLabel>
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
              <FormLabel>User&apos;s to Remove</FormLabel>
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
        <DialogFooter className="sm:justify-end gap-1">
          {fetchError && <div className="text-xs text-red-500">{fetchError}</div>}
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={() => form.reset()}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
