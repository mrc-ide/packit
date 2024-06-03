import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { KeyedMutator } from "swr";
import { z } from "zod";
import appConfig from "../../../../config/appConfig";
import { ApiError } from "../../../../lib/errors";
import { fetcher } from "../../../../lib/fetch";
import { Button } from "../../Base/Button";
import { DialogClose, DialogFooter } from "../../Base/Dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../Base/Form";
import { Input } from "../../Base/Input";
import { RoleWithRelationships } from "./types/RoleWithRelationships";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger
} from "../../Base/MultiSelect";
import { HttpStatus } from "../../../../lib/types/HttpStatus";

interface AddUserFormProps {
  mutate: KeyedMutator<RoleWithRelationships[]>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  roleNames: string[];
}
export const AddUserForm = ({ mutate, setOpen, roleNames }: AddUserFormProps) => {
  const [fetchError, setFetchError] = useState("");

  const formSchema = z.object({
    email: z.string().email(),
    displayName: z
      .string()
      .min(1)
      .regex(
        /^[a-zA-Z0-9]+(\s[a-zA-Z0-9]+)*$/,
        "Name must only contain alphanumeric characters & no leading/trailing spaces."
      ),
    password: z.string().min(8),
    userRoles: z.array(z.string())
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      displayName: "",
      password: "",
      userRoles: []
    }
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetcher({
        url: `${appConfig.apiUrl()}/user/basic`,
        body: values,
        method: "POST"
      });
      form.reset();
      setOpen(false);
      mutate();
    } catch (error) {
      console.error(error);
      if (error instanceof ApiError && error.status === HttpStatus.BadRequest) {
        return form.setError("email", { message: error.message });
      }
      setFetchError("An unexpected error occurred. Please try again.");
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input autoComplete="email" placeholder="enter email..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input autoComplete="name" placeholder="enter display name..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Temporary Password</FormLabel>
              <FormDescription className="text-xs mt-0">User must change this password on first login.</FormDescription>
              <FormControl>
                <Input type="password" autoComplete="password" placeholder="enter password..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userRoles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User&apos;s Roles</FormLabel>
              <MultiSelector onValuesChange={field.onChange} values={field.value}>
                <MultiSelectorTrigger>
                  <MultiSelectorInput className="text-sm" placeholder="Select Roles" />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                  <MultiSelectorList>
                    {roleNames.map((roleName) => (
                      <MultiSelectorItem key={roleName} value={roleName}>
                        {roleName}
                      </MultiSelectorItem>
                    ))}
                  </MultiSelectorList>
                </MultiSelectorContent>
              </MultiSelector>
              <FormDescription className="text-xs mt-0">
                You can add user-specific permissions after the user has been created.
              </FormDescription>
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
          <Button type="submit">Add</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
