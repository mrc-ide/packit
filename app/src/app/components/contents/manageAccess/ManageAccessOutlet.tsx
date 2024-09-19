import { Outlet, useOutletContext } from "react-router-dom";
import { useGetUsersAndRoles } from "./hooks/useGetUsersAndRoles";
import { ErrorComponent } from "../common/ErrorComponent";
import { Skeleton } from "../../Base/Skeleton";
import { Role } from "./types/Role";
import { User } from "./types/User";
import { KeyedMutator } from "swr";

export const ManageAccessOutlet = () => {
  const { users, roles, isLoading, error, mutate } = useGetUsersAndRoles();

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
  roles: Role[];
  users: User[];
  mutate: KeyedMutator<never>;
}
export const useManageAccessLayoutContext = () => useOutletContext<ManageAccessLayoutContext>();
