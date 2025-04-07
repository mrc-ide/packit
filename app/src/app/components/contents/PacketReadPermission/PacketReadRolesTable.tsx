import { useState } from "react";
import { DataTable } from "../common/DataTable";
import { FilterInput } from "../common/FilterInput";
import { RoleWithRelationships } from "../manageAccess/types/RoleWithRelationships";
import { packetReadRolesColumns } from "./utils/packetReadRolesColumns";
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
        <FilterInput setFilter={setFilterValue} placeholder="Search for role or user..." />
      </div>
      <div className="h-80 overflow-auto">
        <DataTable
          columns={packetReadRolesColumns}
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
