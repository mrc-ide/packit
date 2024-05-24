import { useState } from "react";
import { useManageAccessLayoutContext } from "./ManageAccessOutlet";
import { FilterByName } from "../common/FilterByName";
import { Button } from "../../Base/Button";
import { SquarePlus } from "lucide-react";
import { useAuthConfig } from "../../providers/AuthConfigProvider";
import { DataTable } from "../common/DataTable";
import { manageUsersColumns } from "./utils/manageUsersColumns";

export const ManageUsers = () => {
  const { users } = useManageAccessLayoutContext();
  const authConfig = useAuthConfig();
  const [filteredName, setFilterByName] = useState("");

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manage Users</h2>
        <p className="text-muted-foreground">Add users, update roles and permissions on users</p>
      </div>
      <div className="space-y-4 flex flex-col">
        <div className="flex justify-between">
          <FilterByName setFilterByName={setFilterByName} />
          {authConfig?.enableBasicLogin && (
            <Button
              onClick={() => {
                "TODO";
              }}
              variant="outline"
              size="sm"
            >
              <SquarePlus className="mr-2 h-5 w-5" />
              Add User
            </Button>
          )}
        </div>
        <DataTable
          columns={manageUsersColumns}
          data={
            filteredName
              ? users.filter((user) => user.username.toLowerCase().includes(filteredName.toLowerCase()))
              : users
          }
          enablePagination
        />
      </div>
    </>
  );
};
