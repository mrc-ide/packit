import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { KeyedMutator } from "swr";
import { z } from "zod";
import appConfig from "../../../../config/appConfig";
import { ApiError } from "../../../../lib/errors";
import { fetcher } from "../../../../lib/fetch";
import { Form, FormDescription, FormField, FormItem, FormLabel } from "../../Base/Form";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger
} from "../../Base/MultiSelect";
import { CustomDialogFooter } from "../common/CustomDialogFooter";
import { RoleWithRelationships } from "../manageAccess/types/RoleWithRelationships";
import { UserWithRoles } from "../manageAccess/types/UserWithRoles";
import { getRolesAndUsersCantReadGroup, getRoleUsersWithReadGroup } from "./utils/getRolesAndUsersForPacketReadUpdate";
import { cn } from "../../../../lib/cn";

interface UpdatePacketReadPermissionFormProps {
  roles: RoleWithRelationships[];
  users: UserWithRoles[];
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  packetGroupName: string;
  mutate: KeyedMutator<RoleWithRelationships[]>;
}
export const UpdatePacketReadPermissionForm = ({
  roles,
  users,
  setDialogOpen,
  packetGroupName,
  mutate
}: UpdatePacketReadPermissionFormProps) => {
  const [fetchError, setFetchError] = useState("");
  const rolesAndUsersCantReadGroup = getRolesAndUsersCantReadGroup(roles, users, packetGroupName);
  const rolesAndUsersWithReadGroup = getRoleUsersWithReadGroup(roles, users, packetGroupName);

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
    try {
      await fetcher({
        url: `${appConfig.apiUrl()}/roles/${packetGroupName}/read-permissions`,
        body: values,
        method: "PUT"
      });

      form.reset();
      setDialogOpen(false);
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
          name="roleNamesToAdd"
          render={({ field }) => (
            <FormItem>
              <FormDescription className="text-xs mb-0.5">
                Select roles or specific users to grant read access to the packet group. Roles or users with global read
                access cannot be added here as they already have the required permissions. Similarly, roles or users
                with global permissions cannot have their access removed.
              </FormDescription>
              <FormLabel>Grant read access</FormLabel>
              <MultiSelector onValuesChange={field.onChange} values={field.value}>
                <MultiSelectorTrigger>
                  <MultiSelectorInput className="text-sm" placeholder="Select roles or users..." />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                  <MultiSelectorList>
                    {rolesAndUsersCantReadGroup.map((userRole) => {
                      const isUsername = "username" in userRole;
                      return (
                        <MultiSelectorItem
                          className={cn(
                            isUsername ? "text-[#2C5282] dark:text-[#90CDF4]" : "text-[#7B341E] dark:text-[#FBD38D]"
                          )}
                          key={userRole.id}
                          value={isUsername ? userRole.username : userRole.name}
                        >
                          <div className="flex justify-between w-full">
                            <span>{isUsername ? userRole.username : userRole.name}</span>
                            <span className="text-muted-foreground ">{isUsername ? "User" : "Role"}</span>
                          </div>
                        </MultiSelectorItem>
                      );
                    })}
                  </MultiSelectorList>
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
                  {/* make into own component to reuse */}
                  <MultiSelectorList>
                    {rolesAndUsersWithReadGroup.map((userRole) => {
                      const isUsername = "username" in userRole;
                      return (
                        <MultiSelectorItem
                          className={cn(
                            isUsername ? "text-[#2C5282] dark:text-[#90CDF4]" : "text-[#7B341E] dark:text-[#FBD38D]"
                          )}
                          key={userRole.id}
                          value={isUsername ? userRole.username : userRole.name}
                        >
                          <div className="flex justify-between w-full">
                            <span>{isUsername ? userRole.username : userRole.name}</span>
                            <span className="text-muted-foreground ">{isUsername ? "User" : "Role"}</span>
                          </div>
                        </MultiSelectorItem>
                      );
                    })}
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
