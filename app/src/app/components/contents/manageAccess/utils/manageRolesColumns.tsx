import { createColumnHelper } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { KeyedMutator } from "swr";
import { constructPermissionName } from "../../../../../lib/constructPermissionName";
import { Button } from "../../../Base/Button";
import { ScrollArea } from "../../../Base/ScrollArea";
import { DeleteUserOrRole } from "../DeleteUserOrRole";
import { UpdateRoleDropDownMenu } from "../manageRoleActions/UpdateRoleDropDownMenu";
import { RoleWithRelationships } from "../types/RoleWithRelationships";
import { UserWithRoles } from "../types/UserWithRoles";

const columnHelper = createColumnHelper<RoleWithRelationships>();

export const setupManageRolesColumns = (mutate: KeyedMutator<RoleWithRelationships[]>, users: UserWithRoles[]) => [
  columnHelper.accessor("name", {
    header: "Role",
    cell: ({ getValue }) => {
      return <div>{getValue()}</div>;
    }
  }),
  columnHelper.accessor("rolePermissions", {
    header: "Permissions",
    cell: ({ getValue }) => {
      const permissions = getValue();

      return (
        <ScrollArea className="h-14" type="auto">
          <div className="flex flex-wrap italic gap-0.5  text-xs pl-0.5">
            {permissions?.length === 0
              ? "None"
              : permissions.map((permission, index) => (
                  <div key={permission.id}>
                    {index === permissions.length - 1
                      ? constructPermissionName(permission)
                      : constructPermissionName(permission) + ","}
                  </div>
                ))}
          </div>
        </ScrollArea>
      );
    }
  }),
  columnHelper.accessor("users", {
    header: "Users",
    cell: ({ getValue }) => {
      const users = getValue();

      return (
        <ScrollArea className="h-14" type="auto">
          <div className="flex flex-wrap gap-1 italic text-xs pl-0.5">
            {users?.length === 0
              ? "None"
              : users.map((user, index) => (
                  <div key={user.id}>{index === users.length - 1 ? user.username : user.username + ", "}</div>
                ))}
          </div>
        </ScrollArea>
      );
    }
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2 justify-end ">
          {row.original.name === "ADMIN" ? (
            <Button variant="outline" size="icon" aria-label="delete-role" disabled>
              <Trash2 className="h-4 w-4 " />
            </Button>
          ) : (
            <DeleteUserOrRole mutate={mutate} data={{ name: row.original.name, type: "role" }} />
          )}
          <UpdateRoleDropDownMenu mutate={mutate} role={row.original} users={users} />
        </div>
      );
    }
  })
];
