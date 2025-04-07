import { useState } from "react";
import { DataTable } from "../common/DataTable";
import { useManageAccessLayoutContext } from "./ManageAccessOutlet";

import { AddRoleButton } from "./AddRoleButton";
import { FilterInput } from "../common/FilterInput";
import { PAGE_SIZE } from "../../../../lib/constants";
import { setupManageRolesColumns } from "./utils/manageRolesColumns";
import { rolesGlobalFilterFn } from "./utils/rolesTableGlobalFilterFn";

export const ManageRoles = () => {
  const { roles, users, mutate } = useManageAccessLayoutContext();
  const [filterValue, setFilterValue] = useState("");

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manage Roles</h2>
        <p className="text-muted-foreground">Add roles, update users and permissions on roles</p>
      </div>
      <div className="space-y-4 flex flex-col">
        <div className="flex justify-between">
          <FilterInput setFilter={setFilterValue} placeholder="Search by role or user..." />
          <AddRoleButton mutate={mutate} />
        </div>
        <DataTable
          columns={setupManageRolesColumns(mutate, users)}
          data={roles}
          pagination={{ pageSize: PAGE_SIZE }}
          clientFiltering
          globalFiltering={{
            globalFilter: filterValue,
            setGlobalFilter: setFilterValue,
            globalFilterFn: rolesGlobalFilterFn,
            globalFilterCols: ["name", "users"]
          }}
        />
      </div>
    </>
  );
};
