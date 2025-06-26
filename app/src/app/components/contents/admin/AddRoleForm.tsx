import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { KeyedMutator } from "swr";
import { z } from "zod";
import appConfig from "../../../../config/appConfig";
import { GLOBAL_PERMISSIONS } from "../../../../lib/constants";
import { ApiError } from "../../../../lib/errors";
import { fetcher } from "../../../../lib/fetch";
import { HttpStatus } from "../../../../lib/types/HttpStatus";
import { Checkbox } from "../../Base/Checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../Base/Form";
import { Input } from "../../Base/Input";
import { CustomDialogFooter } from "../common/CustomDialogFooter";
import { RoleWithRelationships } from "./types/RoleWithRelationships";

interface AddRoleFormProps {
  mutate: KeyedMutator<RoleWithRelationships[]>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}
export const AddRoleForm = ({ mutate, setOpen }: AddRoleFormProps) => {
  const [fetchError, setFetchError] = useState("");

  const formSchema = z.object({
    name: z
      .string()
      .min(1)
      .regex(
        /^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$/,
        "Name must only contain alphanumeric characters & no leading/trailing spaces."
      ),
    permissionNames: z.array(z.string())
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      permissionNames: []
    }
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetcher({
        url: `${appConfig.apiUrl()}/roles`,
        body: values,
        method: "POST"
      });
      form.reset();
      setOpen(false);
      mutate();
    } catch (error) {
      console.error(error);
      if (error instanceof ApiError && error.status === HttpStatus.BadRequest) {
        return form.setError("name", { message: error.message });
      }
      setFetchError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input autoComplete="name" placeholder="Enter role name..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="permissionNames"
          render={() => (
            <FormItem>
              <div className="mb-3">
                <FormLabel>Global Permissions</FormLabel>
                <FormDescription className="text-xs">
                  Select any global permissions to be assigned to this role
                </FormDescription>
              </div>
              {GLOBAL_PERMISSIONS.map((permission, idx) => (
                <FormField
                  key={`permission-${idx}`}
                  control={form.control}
                  name="permissionNames"
                  render={({ field }) => {
                    return (
                      <FormItem key={`permission-${idx}`} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(permission)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, permission])
                                : field.onChange(field.value?.filter((value) => value !== permission));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{permission}</FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />
        <CustomDialogFooter error={fetchError} onCancel={form.reset} submitText="Add" />
      </form>
    </Form>
  );
};
