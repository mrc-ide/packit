import { useState } from "react";
import { useAuthConfig } from "../../providers/AuthConfigProvider";
import { DataTable } from "../common/DataTable";
import { useManageAccessLayoutContext } from "./ManageAccessOutlet";

import { PAGE_SIZE } from "../../../../lib/constants";
import { FilterInput } from "../common/FilterInput";
import { AddBasicUserButton } from "./AddBasicUserButton";
import { setupManageUsersColumns } from "./utils/manageUsersColumns";
import { usersGlobalFilterFn } from "./utils/rolesTableGlobalFilterFn";

export const ManageUsers = () => {
  const { users, mutate, roles } = useManageAccessLayoutContext();
  const authConfig = useAuthConfig();
  const [filterValue, setFilterValue] = useState("");

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manage Users</h2>
        <p className="text-muted-foreground">Add users, update roles and permissions on users</p>
      </div>
      <div className="space-y-4 flex flex-col">
        <div className="flex justify-between">
          <FilterInput setFilter={setFilterValue} placeholder="Search by user or role..." />
          {authConfig?.enableBasicLogin && (
            <AddBasicUserButton mutate={mutate} roleNames={roles.map((role) => role.name)} />
          )}
        </div>
        <DataTable
          columns={setupManageUsersColumns(mutate, roles)}
          data={users}
          clientFiltering
          globalFiltering={{
            globalFilter: filterValue,
            setGlobalFilter: setFilterValue,
            globalFilterFn: usersGlobalFilterFn,
            globalFilterCols: ["username", "roles"]
          }}
          pagination={{ pageSize: PAGE_SIZE }}
        />
      </div>
    </>
  );
};
