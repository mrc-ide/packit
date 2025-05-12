import { useState } from "react";
import { DataTable } from "../common/DataTable";
import { FilterInput } from "../common/FilterInput";
import { BasicRoleWithUsers } from "../manageAccess/types/RoleWithRelationships";
import { roleDefaultColumns } from "../manageAccess/utils/manageRolesColumns";
import { rolesGlobalFilterFn } from "../manageAccess/utils/rolesTableGlobalFilterFn";
import { ColumnDef, FilterFn } from "@tanstack/react-table";

interface PacketReadRolesTableProps {
  roles: BasicRoleWithUsers[];
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
        <DataTable<BasicRoleWithUsers>
          columns={roleDefaultColumns("h-7") as ColumnDef<BasicRoleWithUsers, any>[]}
          clientFiltering
          data={roles}
          globalFiltering={{
            globalFilter: filterValue,
            setGlobalFilter: setFilterValue,
            globalFilterFn: rolesGlobalFilterFn as FilterFn<BasicRoleWithUsers>,
            globalFilterCols: ["name", "users"]
          }}
        />
      </div>
    </div>
  );
};
