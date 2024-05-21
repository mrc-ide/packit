import { createColumnHelper } from "@tanstack/react-table";
import { RoleWithRelationships } from "./types/RoleWithRelationships";
import { constructPermissionName } from "../../../../lib/constructPermissionName";
import { Button } from "../../Base/Button";
import { EllipsisVertical, Trash2 } from "lucide-react";
import { ScrollArea } from "../../Base/ScrollArea";

const columnHelper = createColumnHelper<RoleWithRelationships>();

export const manageRolesColumns = [
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
        <ScrollArea className="h-12">
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
        <ScrollArea className="h-12">
          <div className="flex flex-wrap gap-1 italic text-xs">
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
      // TODO: Implement
      return (
        <div className="flex space-x-2 justify-end ">
          <Button variant="outline" size="icon">
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
          <Button variant="outline" size="icon">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </div>
      );
    }
  })
];
