import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { constructPermissionName } from "../../../../../lib/constructPermissionName";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../Base/Form";
import { Button } from "../../../Base/Button";
import { SquarePlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../Base/Select";
import { GLOBAL_PERMISSIONS, PERMISSION_SCOPES } from "../../../../../lib/constants";
import { RadioGroup, RadioGroupItem } from "../../../Base/RadioGroup";

interface AddPermissionForUpdateFormProps {
  addPermission: (permission: string, packetId?: string, packetGroupId?: number, tagId?: number) => void;
}
export const AddPermissionForUpdateForm = ({ addPermission }: AddPermissionForUpdateFormProps) => {
  const formSchema = z.object({
    permission: z.string(),
    scope: z.string(),
    packetId: z.string().optional(),
    packetGroupId: z.number().optional(),
    tagId: z.number().optional()
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      permission: "",
      scope: "global"
    }
  });
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    addPermission(values.permission, values.packetId, values.packetGroupId, values.tagId);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
        <FormLabel>Permissions To Add</FormLabel>
        <FormField
          control={form.control}
          name="permission"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Permission</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a permission" />
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
                  defaultValue={field.value}
                  className="flex flex-row space-x-3"
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
        <Button type="submit" variant="outline" size="icon">
          <SquarePlus className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
};
