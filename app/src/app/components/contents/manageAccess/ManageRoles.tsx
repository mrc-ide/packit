import { Skeleton } from "../../Base/Skeleton";
import { DataTable } from "../common/DataTable";
import { ErrorComponent } from "../common/ErrorComponent";
import { useGetRolesWithRelationships } from "./hooks/useGetRolesWithRelationships";
import { manageRolesColumns } from "./manageRolesColumns";

export const ManageRoles = () => {
  const { roles, isLoading, error } = useGetRolesWithRelationships();

  console.log(roles);

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
      {roles && <DataTable columns={manageRolesColumns} data={roles.filter((role) => !role.isUsername)} />}
    </>
  );
};
