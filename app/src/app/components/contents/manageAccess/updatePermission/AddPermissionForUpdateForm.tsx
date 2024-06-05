import { zodResolver } from "@hookform/resolvers/zod";
import { SquarePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { GLOBAL_PERMISSIONS, PERMISSION_SCOPES } from "../../../../../lib/constants";
import { Button } from "../../../Base/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../Base/Form";
import { RadioGroup, RadioGroupItem } from "../../../Base/RadioGroup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../Base/Select";
import { AddScopedPermissionInput } from "./AddScopedPermissionInput";
import { updatePermissionSchema } from "./UpdatePermissionsForm";

export const addPermissionFormSchema = z
  .object({
    permission: z.enum(GLOBAL_PERMISSIONS),
    scope: z.enum(PERMISSION_SCOPES),
    scopeResource: z.object({
      id: z.string(),
      name: z.string()
    })
  })
  .refine((data) => data.scope === "global" || !!data.scopeResource?.id, {
    message: "Scoped name is required if not global scope ",
    path: ["scope"]
  });
interface AddPermissionForUpdateFormProps {
  addPermission: (values: z.infer<typeof updatePermissionSchema>) => void;
}
export const AddPermissionForUpdateForm = ({ addPermission }: AddPermissionForUpdateFormProps) => {
  const form = useForm<z.infer<typeof addPermissionFormSchema>>({
    resolver: zodResolver(addPermissionFormSchema),
    defaultValues: {
      scope: "global"
    }
  });
  const onSubmit = (addPermissionValues: z.infer<typeof addPermissionFormSchema>) => {
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
    addPermission(addPermissionValue);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 w-[350px]">
        <FormLabel>Permissions To Add</FormLabel>
        <FormField
          control={form.control}
          name="permission"
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  if (value === "user.manage") {
                    form.setValue("scope", "global");
                  }
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Permission..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {GLOBAL_PERMISSIONS.map((permission) => (
                    <SelectItem key={permission} value={permission}>
                      {permission}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="scope"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scope</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  className="flex flex-row space-x-3"
                  disabled={!form.watch("permission") || form.watch("permission") === "user.manage"}
                  value={field.value}
                >
                  {PERMISSION_SCOPES.map((scope) => (
                    <FormItem key={scope} className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={scope} />
                      </FormControl>
                      <FormLabel className="font-normal">{scope}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <AddScopedPermissionInput scope={form.watch("scope")} form={form} />
        <Button type="submit" variant="outline" size="icon">
          <SquarePlus className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
};
