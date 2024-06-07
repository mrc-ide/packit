import { createColumnHelper } from "@tanstack/react-table";
import { constructPermissionName } from "../../../../../lib/constructPermissionName";
import { Button } from "../../../Base/Button";
import { EllipsisVertical, Trash2 } from "lucide-react";
import { ScrollArea } from "../../../Base/ScrollArea";
import { UserWithRoles } from "../types/UserWithRoles";

const columnHelper = createColumnHelper<UserWithRoles>();

export const manageUsersColumns = [
  columnHelper.accessor("username", {
    header: "Username",
    cell: ({ getValue }) => {
      return <div>{getValue()}</div>;
    }
  }),
  columnHelper.accessor("roles", {
    header: "Roles",
    cell: ({ getValue }) => {
      const roles = getValue();

      return (
        <ScrollArea className="h-12">
          <div className="flex flex-wrap italic gap-0.5 text-xs pl-0.5">
            {roles?.length === 0
              ? "None"
              : roles.map((role, index) => (
                  <div key={role.id}>{index === roles.length - 1 ? role.name : role.name + ","}</div>
                ))}
          </div>
        </ScrollArea>
      );
    }
  }),
  columnHelper.accessor("specificPermissions", {
    header: "User Specific Permissions",
    cell: ({ getValue }) => {
      const rolePermissions = getValue();

      return (
        <ScrollArea className="h-12">
          <div className="flex flex-wrap gap-1 italic text-xs pl-0.5">
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
        </ScrollArea>
      );
    }
  }),
  columnHelper.display({
    id: "actions",
    cell: () => {
      // TODO: Implement with row data
      return (
        <div className="flex space-x-2 justify-end ">
          <Button variant="outline" size="icon" aria-label="delete-user">
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
          <Button variant="outline" size="icon" aria-label="edit-user">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </div>
      );
    }
  })
];
