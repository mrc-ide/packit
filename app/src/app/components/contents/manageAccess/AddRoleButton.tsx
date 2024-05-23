import { zodResolver } from "@hookform/resolvers/zod";
import { SquarePlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { GLOBAL_PERMISSIONS } from "../../../../lib/constants";
import { Button } from "../../Base/Button";
import { Checkbox } from "../../Base/Checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../../Base/Dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../Base/Form";
import { Input } from "../../Base/Input";
import { fetcher } from "../../../../lib/fetch";
import appConfig from "../../../../config/appConfig";
import { ApiError } from "../../../../lib/errors";
import { HttpStatus } from "../../../../lib/types/HttpStatus";
import { KeyedMutator } from "swr";
import { RoleWithRelationships } from "./types/RoleWithRelationships";

interface AddRoleButtonProps {
  mutate: KeyedMutator<RoleWithRelationships[]>;
}
export const AddRoleButton = ({ mutate }: AddRoleButtonProps) => {
  const [open, setOpen] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const formSchema = z.object({
    name: z.string().min(1),
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
        url: `${appConfig.apiUrl()}/role`,
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <SquarePlus className="mr-2 h-5 w-5" />
          Add Role
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new Role</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Name</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" placeholder="enter role name..." {...field} />
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
                    <FormLabel className="text-base">Permissions</FormLabel>
                    <FormDescription>Select the permissions that will be assigned to this role.</FormDescription>
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
                                onCheckedChange={(checked: any) => {
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
            <DialogFooter className="sm:justify-end gap-1">
              {fetchError && <div className="text-xs text-red-500">{fetchError}</div>}
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
