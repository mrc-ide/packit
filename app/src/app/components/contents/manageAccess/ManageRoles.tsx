import { SquarePlus, X } from "lucide-react";
import { Button } from "../../Base/Button";
import { Input } from "../../Base/Input";
import { Skeleton } from "../../Base/Skeleton";
import { DataTable } from "../common/DataTable";
import { ErrorComponent } from "../common/ErrorComponent";
import { useGetRolesWithRelationships } from "./hooks/useGetRolesWithRelationships";
import { manageRolesColumns } from "./manageRolesColumns";
import { useAuthConfig } from "../../providers/AuthConfigProvider";
import { useCallback, useEffect, useRef, useState } from "react";
import debounce from "lodash.debounce";

export const ManageRoles = () => {
  const { roles, isLoading, error } = useGetRolesWithRelationships();
  const authConfig = useAuthConfig();
  const [filterByName, setFilterByName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSetNameFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterByName(event.target.value);
  };
  const handleResetFilter = () => {
    if (inputRef?.current) {
      inputRef.current.value = "";
    }
    setFilterByName("");
  };
  const debouncedSetFilterByName = useCallback(debounce(handleSetNameFilter, 300), []);

  useEffect(() => {
    return () => {
      debouncedSetFilterByName.cancel();
    };
  }, []);

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
          <div className="flex space-x-4">
            <Input
              placeholder="Find Role by name..."
              onChange={debouncedSetFilterByName}
              className="h-8 sm:w-[450px] lg:w-[600px]"
              ref={inputRef}
            />
            {filterByName && (
              <Button variant="ghost" onClick={handleResetFilter} className="h-8 px-2 lg:px-3">
                Reset
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
          {authConfig?.enableBasicLogin && (
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
          )}
        </div>
        {roles && (
          <DataTable
            columns={manageRolesColumns}
            data={roles.filter((role) => role.name.toLowerCase().includes(filterByName.toLowerCase()))}
            enablePagination
          />
        )}
      </div>
    </>
  );
};
