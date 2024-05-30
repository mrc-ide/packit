import { useState } from "react";
import { DataTable } from "../common/DataTable";
import { useManageAccessLayoutContext } from "./ManageAccessOutlet";

import { AddRoleButton } from "./AddRoleButton";
import { FilterInput } from "../common/FilterInput";
import { PAGE_SIZE } from "../../../../lib/constants";
import { setupManageRolesColumns } from "./utils/manageRolesColumns";

export const ManageRoles = () => {
  const { roles, users, mutate } = useManageAccessLayoutContext();
  const [filteredName, setFilterByName] = useState("");

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manage Roles</h2>
        <p className="text-muted-foreground">Add roles, update users and permissions on roles</p>
      </div>
      <div className="space-y-4 flex flex-col">
        <div className="flex justify-between">
          <FilterInput setFilter={setFilterByName} placeholder="Filter roles by name..." />
          <AddRoleButton mutate={mutate} />
        </div>
        <DataTable
          columns={setupManageRolesColumns(mutate, users)}
          data={
            filteredName ? roles.filter((role) => role.name.toLowerCase().includes(filteredName.toLowerCase())) : roles
          }
          pagination={{ pageSize: PAGE_SIZE }}
        />
      </div>
    </>
  );
};
