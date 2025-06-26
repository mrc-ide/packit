import { Outlet, useOutletContext } from "react-router-dom";
import { useGetRolesAndUsersWithPermissions } from "./hooks/useGetRolesAndUsersWithPermissions";
import { ErrorComponent } from "../common/ErrorComponent";
import { Skeleton } from "../../Base/Skeleton";
import { RoleWithRelationships } from "./types/RoleWithRelationships";
import { UserWithPermissions } from "./types/UserWithPermissions";
import { KeyedMutator } from "swr";
import { Unauthorized } from "../common/Unauthorized";
import { HttpStatus } from "../../../../lib/types/HttpStatus";

export const AdminOutlet = () => {
  const { roles, users, isLoading, error, mutate } = useGetRolesAndUsersWithPermissions();

  if (error) {
    if (error.status === HttpStatus.Unauthorized) {
      return <Unauthorized />;
    }
    return <ErrorComponent message="Error fetching data" error={error} />;
  }

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
  users: UserWithPermissions[];
  mutate: KeyedMutator<RoleWithRelationships[]>;
}
export const useManageAccessLayoutContext = () => useOutletContext<ManageAccessLayoutContext>();
