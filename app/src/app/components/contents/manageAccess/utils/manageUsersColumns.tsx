import { createColumnHelper } from "@tanstack/react-table";
import { EllipsisVertical, Trash2 } from "lucide-react";
import { KeyedMutator } from "swr";
import { constructPermissionName } from "../../../../../lib/constructPermissionName";
import { Button } from "../../../Base/Button";
import { useUser } from "../../../providers/UserProvider";
import { DeleteUserOrRole } from "../DeleteUserOrRole";
import { UpdateUserDropdownMenu } from "../manageUsersActions/UpdateUserDropdownMenu";
import { RoleWithRelationships } from "../types/RoleWithRelationships";
import { UserWithPermissions } from "../types/UserWithPermissions";

const columnHelper = createColumnHelper<UserWithPermissions>();

export const setupManageUsersColumns = (
  mutate: KeyedMutator<RoleWithRelationships[]>,
  roles: RoleWithRelationships[]
) => [
  columnHelper.accessor("username", {
    header: "User",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span>{row.original.username}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.displayName ? row.original.displayName : "No display name"}
          </span>
          <span className="text-xs text-muted-foreground">{row.original.email ? row.original.email : "No email"}</span>
        </div>
      );
    }
  }),
  columnHelper.accessor("roles", {
    header: "Roles",
    cell: ({ getValue }) => {
      const roles = getValue();

      return (
        <div className="flex flex-wrap italic gap-0.5 text-xs pl-0.5 max-h-20 overflow-auto [&::-webkit-scrollbar]:w-2">
          {roles?.length === 0
            ? "None"
            : roles.map((role, index) => (
                <div key={role.id}>{index === roles.length - 1 ? role.name : role.name + ","}</div>
              ))}
        </div>
      );
    }
  }),
  columnHelper.accessor("specificPermissions", {
    header: "User Specific Permissions",
    cell: ({ getValue }) => {
      const rolePermissions = getValue();

      return (
        <div className="flex flex-wrap gap-1 italic text-xs pl-0.5 max-h-20 overflow-auto [&::-webkit-scrollbar]:w-2">
          {rolePermissions?.length === 0
            ? "None"
            : rolePermissions.map((permission, index) => (
                <div key={permission.id}>
                  {index === rolePermissions.length - 1
                    ? constructPermissionName(permission)
                    : constructPermissionName(permission) + ","}
                </div>
              ))}
        </div>
      );
    }
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      const { user } = useUser();
      return (
        <div className="flex space-x-2 justify-end ">
          {row.original.username === user?.userName ? (
            <>
              <Button variant="outline" size="icon" aria-label="delete-user" disabled>
                <Trash2 className="h-4 w-4 " />
              </Button>
              <Button variant="outline" size="icon" aria-label="edit-user" disabled>
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <DeleteUserOrRole mutate={mutate} data={{ name: row.original.username, type: "user" }} />
              <UpdateUserDropdownMenu user={row.original} roles={roles} mutate={mutate} />
            </>
          )}
        </div>
      );
    }
  })
];
