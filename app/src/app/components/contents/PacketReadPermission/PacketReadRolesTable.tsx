import { useState } from "react";
import { DataTable } from "../common/DataTable";
import { FilterInput } from "../common/FilterInput";
import { RoleWithRelationships } from "../manageAccess/types/RoleWithRelationships";
import { roleDefaultColumns } from "../manageAccess/utils/manageRolesColumns";
import { rolesGlobalFilterFn } from "../manageAccess/utils/rolesTableGlobalFilterFn";

interface PacketReadRolesTableProps {
  roles: RoleWithRelationships[];
}
export const PacketReadRolesTable = ({ roles }: PacketReadRolesTableProps) => {
  const [filterValue, setFilterValue] = useState("");

  return (
    <div className="space-y-2 flex flex-col">
      <h3 className="font-semibold tracking-tight">Roles with read access</h3>
      <div className="flex justify-between">
        <FilterInput setFilter={setFilterValue} placeholder="Search by role or user..." />
      </div>
      <div className="max-h-96 overflow-auto">
        <DataTable
          columns={roleDefaultColumns("h-7")}
          clientFiltering
          data={roles}
          globalFiltering={{
            globalFilter: filterValue,
            setGlobalFilter: setFilterValue,
            globalFilterFn: rolesGlobalFilterFn,
            globalFilterCols: ["name", "users"]
          }}
        />
      </div>
    </div>
  );
};
