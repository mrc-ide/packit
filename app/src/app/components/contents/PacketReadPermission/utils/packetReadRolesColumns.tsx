import { createColumnHelper } from "@tanstack/react-table";
import { ScrollArea } from "../../../Base/ScrollArea";
import { RoleWithRelationships } from "../../manageAccess/types/RoleWithRelationships";

const columnHelper = createColumnHelper<RoleWithRelationships>();
export const packetReadRolesColumns = [
  columnHelper.accessor("name", {
    header: "Role",
    cell: ({ getValue }) => {
      return <div>{getValue()}</div>;
    }
  }),
  columnHelper.accessor("users", {
    header: "Users",
    cell: ({ getValue }) => {
      const users = getValue();
      return (
        <ScrollArea className="h-6" type="auto">
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
  })
];
