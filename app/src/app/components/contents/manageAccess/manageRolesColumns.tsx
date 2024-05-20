import { createColumnHelper } from "@tanstack/react-table";
import { RoleWithRelationships } from "./types/RoleWithRelationships";
import { constructPermissionName } from "../../../../lib/constructPermissionName";
import { Button } from "../../Base/Button";
import { EllipsisVertical, Trash2 } from "lucide-react";

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
        <div className="flex flex-wrap gap-1 italic text-xs overflow-y-auto max-h-14">
          {permissions?.length === 0
            ? "None"
            : permissions.map((rolePermission, index) => (
                <div key={rolePermission.id}>
                  {index === permissions.length - 1
                    ? constructPermissionName(rolePermission)
                    : constructPermissionName(rolePermission) + ", "}
                </div>
              ))}
        </div>
      );
    }
  }),
  columnHelper.accessor("users", {
    header: "Users",
    cell: ({ getValue }) => {
      const users = getValue();

      return (
        <div className="flex flex-wrap gap-1 italic text-xs">
          {users?.length === 0
            ? "None"
            : users.map((user, index) => (
                <div key={user.id}>{index === users.length - 1 ? user.username : user.username + ", "}</div>
              ))}
        </div>
      );
    }
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
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
