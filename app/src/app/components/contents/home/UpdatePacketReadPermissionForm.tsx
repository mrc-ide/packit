import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { KeyedMutator } from "swr";
import { z } from "zod";
import appConfig from "../../../../config/appConfig";
import { ApiError } from "../../../../lib/errors";
import { fetcher } from "../../../../lib/fetch";
import { Form, FormDescription, FormField, FormItem, FormLabel } from "../../Base/Form";
import { MultiSelector, MultiSelectorContent, MultiSelectorInput, MultiSelectorTrigger } from "../../Base/MultiSelect";
import { CustomDialogFooter } from "../common/CustomDialogFooter";
import { RoleWithRelationships } from "../manageAccess/types/RoleWithRelationships";
import { UserWithRoles } from "../manageAccess/types/UserWithRoles";
import { UpdatePacketReadPermissionMultiSelectList } from "./UpdatePacketReadPermissionMultiSelectList";

interface UpdatePacketReadPermissionFormProps {
  rolesAndUsersCantRead: (RoleWithRelationships | UserWithRoles)[];
  rolesAndUsersWithRead: (RoleWithRelationships | UserWithRoles)[];
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  packetGroupName: string;
  mutate: KeyedMutator<RoleWithRelationships[]>;
  packetId?: string;
}
export const UpdatePacketReadPermissionForm = ({
  rolesAndUsersCantRead,
  rolesAndUsersWithRead,
  setDialogOpen,
  packetGroupName,
  mutate,
  packetId
}: UpdatePacketReadPermissionFormProps) => {
  const [error, setError] = useState("");

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
    if (values.roleNamesToAdd.length === 0 && values.roleNamesToRemove.length === 0) {
      return setError("You must add or remove at least one role or user.");
    }

    try {
      await fetcher({
        url: `${appConfig.apiUrl()}/packetGroups/${packetGroupName}/read-permission`,
        body: {
          roleNamesToAdd: values.roleNamesToAdd,
          roleNamesToRemove: values.roleNamesToRemove,
          packetId
        },
        method: "PUT"
      });

      form.reset();
      setDialogOpen(false);
      mutate();
    } catch (error) {
      console.error(error);
      if (error instanceof ApiError) {
        return setError(error.message);
      }
      setError("An unexpected error occurred. Please try again.");
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
              <FormDescription className="text-xs mb-0.5">
                Select roles or specific users to grant read access to this packet{packetId ? "" : " group"}. Roles or
                users with global read access cannot be added here as they already have the required permissions.
                Similarly, roles or users with global access cannot have their access removed here. You also cannot add
                or remove access here for specific users who have access via a role.
              </FormDescription>
              <FormLabel>Grant read access</FormLabel>
              <MultiSelector onValuesChange={field.onChange} values={field.value}>
                <MultiSelectorTrigger>
                  <MultiSelectorInput className="text-sm" placeholder="Select roles or users..." />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                  <UpdatePacketReadPermissionMultiSelectList rolesAndUsers={rolesAndUsersCantRead} />
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
              <FormLabel>Remove read access</FormLabel>
              <MultiSelector onValuesChange={field.onChange} values={field.value}>
                <MultiSelectorTrigger>
                  <MultiSelectorInput className="text-sm" placeholder="Select roles or users..." />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                  <UpdatePacketReadPermissionMultiSelectList rolesAndUsers={rolesAndUsersWithRead} />
                </MultiSelectorContent>
              </MultiSelector>
            </FormItem>
          )}
        />
        <CustomDialogFooter error={error} onCancel={form.reset} submitText="Save" />
      </form>
    </Form>
  );
};
