import { Outlet, useOutletContext } from "react-router-dom";
import { useGetRolesWithRelationships } from "./hooks/useGetRolesWithRelationships";
import { ErrorComponent } from "../common/ErrorComponent";
import { Skeleton } from "../../Base/Skeleton";
import { RoleWithRelationships } from "./types/RoleWithRelationships";
import { UserWithRoles } from "./types/UserWithRoles";
import { KeyedMutator } from "swr";

export const ManageAccessOutlet = () => {
  const { roles, users, isLoading, error, mutate } = useGetRolesWithRelationships();

  if (error) return <ErrorComponent message="Error fetching data" error={error} />;

  if (isLoading)
    return (
      <ul className="flex flex-col border rounded-md">
        {[...Array(2)].map((_val, index) => (
          <li key={index} className="p-4 flex border-b space-x-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-12 w-20" />
          </li>
        ))}
      </ul>
    );
  return roles ? <Outlet context={{ roles, users, mutate }} /> : null;
};

interface ManageAccessLayoutContext {
  roles: RoleWithRelationships[];
  users: UserWithRoles[];
  mutate: KeyedMutator<RoleWithRelationships[]>;
}
export const useManageAccessLayoutContext = () => useOutletContext<ManageAccessLayoutContext>();
