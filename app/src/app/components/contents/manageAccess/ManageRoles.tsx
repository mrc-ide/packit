import { SquarePlus } from "lucide-react";
import { useState } from "react";
import { Button } from "../../Base/Button";
import { Skeleton } from "../../Base/Skeleton";
import { DataTable } from "../common/DataTable";
import { ErrorComponent } from "../common/ErrorComponent";
import { FilterInput } from "../common/FilterInput";
import { useGetRolesWithRelationships } from "./hooks/useGetRolesWithRelationships";
import { manageRolesColumns } from "./manageRolesColumns";
import { PAGE_SIZE } from "../../../../lib/constants";

export const ManageRoles = () => {
  const { roles, isLoading, error } = useGetRolesWithRelationships();

  const [filteredName, setFilterByName] = useState("");

  if (error) return <ErrorComponent message="Error fetching Roles" error={error} />;

  if (isLoading)
    return (
      <ul className="flex flex-col border rounded-md">
        {[...Array(2)].map((_val, index) => (
          <li key={index} className="p-4 flex border-b space-x-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-12 w-64" />
          </li>
        ))}
      </ul>
    );

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manage Roles</h2>
        <p className="text-muted-foreground">Add roles, update users and permissions on roles</p>
      </div>
      <div className="space-y-4 flex flex-col">
        <div className="flex justify-between">
          <FilterInput setFilter={setFilterByName} placeholder="Filter roles by name..." />
          <Button
            onClick={() => {
              "TODO";
            }}
            variant="outline"
            size="sm"
          >
            <SquarePlus className="mr-2 h-5 w-5" />
            Add Role
          </Button>
        </div>
        {roles && (
          <DataTable
            columns={manageRolesColumns}
            data={
              filteredName
                ? roles.filter((role) => role.name.toLowerCase().includes(filteredName.toLowerCase()))
                : roles
            }
            pagination={{ pageSize: PAGE_SIZE }}
          />
        )}
      </div>
    </>
  );
};
