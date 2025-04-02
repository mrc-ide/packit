import { Dispatch, SetStateAction, useState } from "react";
import { UserWithRoles } from "../manageAccess/types/UserWithRoles";
import { RoleWithRelationships } from "../manageAccess/types/RoleWithRelationships";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel } from "../../Base/Form";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorList,
  MultiSelectorTrigger
} from "../../Base/MultiSelect";
import { CustomDialogFooter } from "../common/CustomDialogFooter";
import { canReadPacketGroup } from "../../../../lib/auth/hasPermission";
import { useUser } from "../../providers/UserProvider";
import { UserState } from "../../providers/types/UserTypes";

interface UpdatePacketReadPermissionFormProps {
  roles: RoleWithRelationships[];
  users: UserWithRoles[];
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  packetGroupName: string;
}
const getRoleAndUsersWithoutRead = (
  roles: RoleWithRelationships[],
  users: UserWithRoles[],
  packetGroupName: string
) => {
  const rolesWithoutRead = roles.filter((role) => role);

  const usersWithoutRead = users.filter((user) => user);
};
export const UpdatePacketReadPermissionForm = ({
  roles,
  users,
  setDialogOpen,
  packetGroupName
}: UpdatePacketReadPermissionFormProps) => {
  const [fetchError, setFetchError] = useState("");
  const { user } = useUser();
  console.log(users);
  console.log(roles);

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
    console.log("Form submitted with data:", values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="roleNamesToAdd"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grant read access</FormLabel>
              <MultiSelector onValuesChange={field.onChange} values={field.value}>
                <MultiSelectorTrigger>
                  <MultiSelectorInput className="text-sm" placeholder="Select roles or users..." />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                  <MultiSelectorList>
                    {/* {usersNotInRole.map((user) => (
                      <MultiSelectorItem key={user.id} value={user.username}>
                        {user.username}
                      </MultiSelectorItem>
                    ))} */}
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
                  <MultiSelectorInput className="text-sm" placeholder="Select Usernames to Remove" />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                  <MultiSelectorList>
                    {/* {role.users.map((user) => (
                      <MultiSelectorItem key={user.id} value={user.username}>
                        {user.username}
                      </MultiSelectorItem>
                    ))} */}
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
