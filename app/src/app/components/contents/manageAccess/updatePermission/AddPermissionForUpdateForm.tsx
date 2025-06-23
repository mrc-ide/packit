import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { GLOBAL_PERMISSIONS, PERMISSION_SCOPES, SCOPED_PERMISSIONS } from "../../../../../lib/constants";
import { Button } from "../../../Base/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../Base/Form";
import { RadioGroup, RadioGroupItem } from "../../../Base/RadioGroup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../Base/Select";
import { BaseRolePermission } from "../types/RoleWithRelationships";
import { AddScopedPermissionInput } from "./AddScopedPermissionInput";
import { isDuplicateUpdatePermission } from "./utils/isDuplicateUpdatePermission";
import { cn } from "../../../../../lib/cn";

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
    message: "Select a resource for non-global scope",
    path: ["scope"]
  });
interface AddPermissionForUpdateFormProps {
  addPermission: (values: BaseRolePermission) => void;
  currentPermissions: BaseRolePermission[];
}
export const AddPermissionForUpdateForm = ({ addPermission, currentPermissions }: AddPermissionForUpdateFormProps) => {
  const form = useForm<z.infer<typeof addPermissionFormSchema>>({
    resolver: zodResolver(addPermissionFormSchema),
    defaultValues: {
      scope: "global"
    }
  });
  const onSubmit = (addPermissionValues: z.infer<typeof addPermissionFormSchema>) => {
    const addPermissionValue: BaseRolePermission = {
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
    if (isDuplicateUpdatePermission(currentPermissions, addPermissionValue)) {
      return form.setError("root", {
        message: "Permission already exists"
      });
    }
    addPermission(addPermissionValue);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 w-[350px]">
        <FormLabel className="font-semibold">Permissions to add</FormLabel>
        <FormField
          control={form.control}
          name="permission"
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  if (!SCOPED_PERMISSIONS.includes(value)) {
                    form.setValue("scope", "global");
                  }
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a permission..." />
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
                  disabled={!SCOPED_PERMISSIONS.includes(form.watch("permission"))}
                  value={field.value}
                >
                  {/* TODO: remove tag filter when implemented */}
                  {PERMISSION_SCOPES.filter((scope) => scope !== "tag").map((scope) => (
                    <FormItem key={scope} className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={scope} />
                      </FormControl>
                      <FormLabel
                        className={cn(
                          "font-normal",
                          !SCOPED_PERMISSIONS.includes(form.watch("permission")) && "opacity-70"
                        )}
                      >
                        {scope === "packetGroup" ? "packet group" : scope}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <AddScopedPermissionInput scope={form.watch("scope")} form={form} />
        {form.formState.errors?.root && (
          <div className="text-xs text-destructive">{form.formState.errors.root.message}</div>
        )}
        <Button type="submit" variant="outline" disabled={form.getValues("permission") === undefined}>
          Add Permission
        </Button>
      </form>
    </Form>
  );
};
