import { Dispatch, SetStateAction, useState } from "react";
import { RoleWithRelationships } from "../types/RoleWithRelationships";
import { UserWithRoles } from "../types/UserWithRoles";
import { KeyedMutator } from "swr";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetcher } from "../../../../../lib/fetch";
import appConfig from "../../../../../config/appConfig";
import { ApiError } from "../../../../../lib/errors";
import { Form, FormField, FormItem, FormLabel } from "../../../Base/Form";
import { DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../../Base/Dialog";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger
} from "../../../Base/MultiSelect";
import { Button } from "../../../Base/Button";

interface UpdateUsersProps {
  role: RoleWithRelationships;
  users: UserWithRoles[];
  mutate: KeyedMutator<RoleWithRelationships[]>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}
export const UpdateUsers = ({ role, users, mutate, setOpen }: UpdateUsersProps) => {
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
    <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
      <DialogHeader>
        <DialogTitle>Update Users on {role.name} role</DialogTitle>
      </DialogHeader>
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
    </DialogContent>
  );
};
