import { useState } from "react";
import { DataTable } from "../common/DataTable";
import { useManageAccessLayoutContext } from "./AdminOutlet";

import { HelpCircle } from "lucide-react";
import { PAGE_SIZE } from "../../../../lib/constants";
import { FilterInput } from "../common/FilterInput";
import { AddRoleButton } from "./AddRoleButton";
import { setupManageRolesColumns } from "./utils/manageRolesColumns";
import { rolesGlobalFilterFn } from "./utils/rolesTableGlobalFilterFn";

import { NavLink } from "react-router-dom";
import {Unauthorized} from "../common/Unauthorized";

export const ManageRoles = () => {
  const { roles, users, mutate } = useManageAccessLayoutContext();
  const [filterValue, setFilterValue] = useState("");
  if (!roles) {
      return <Unauthorized />
  }
  return (
    <>
      <div>
        <div className="flex gap-2 items-center">
          <h2 className="text-2xl font-bold tracking-tight">Manage Roles</h2>
          <NavLink to={"/docs/manage-access-help"} className="text-blue-500 hover:text-blue-600">
            <HelpCircle className="h-5 w-5" />
          </NavLink>
        </div>
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
