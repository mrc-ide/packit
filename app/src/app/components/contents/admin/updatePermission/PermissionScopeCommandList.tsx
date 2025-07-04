import { CommandLoading } from "cmdk";
import { Check } from "lucide-react";
import { cn } from "@lib/cn";
import { PermissionScope } from "@lib/constants";
import { CommandEmpty, CommandGroup, CommandItem, CommandList } from "@components/Base/Command";
import { useGetResourcesForScopedPermissions } from "./hooks/useGetResourcesForScopedPermissions";

interface PermissionCommandListProps {
  scope: PermissionScope;
  scopeResource: { id: string; name: string };
  setScopeResource: (value: { id: string; name: string }) => void;
  filterName: string;
  setFilterName: (value: string) => void;
  setOpen: (value: boolean) => void;
}

export const PermissionScopeCommandList = ({
  scope,
  scopeResource,
  setScopeResource,
  filterName,
  setFilterName,
  setOpen
}: PermissionCommandListProps) => {
  const { data, isLoading, error } = useGetResourcesForScopedPermissions(scope, filterName);

  if (error) return <CommandEmpty>Error Fetching data</CommandEmpty>;
  return (
    <CommandList>
      {isLoading && <CommandLoading>Loading {scope}s...</CommandLoading>}
      <CommandEmpty>No {scope}s found.</CommandEmpty>
      <CommandGroup>
        {data?.content?.map((resource) => (
          <CommandItem
            key={resource.id}
            value={resource.id.toString()}
            onSelect={(currentValue) => {
              setScopeResource(
                currentValue === scopeResource.id ? { id: "", name: "" } : { id: currentValue, name: resource.name }
              );
              setFilterName("");
              setOpen(false);
            }}
          >
            <Check
              className={cn("mr-2 h-4 w-4", scopeResource.id === resource.id.toString() ? "opacity-100" : "opacity-0")}
              data-testid={`check-${resource.id}`}
            />
            {scope === "packet" ? `${resource.name}:${resource.id}` : resource.name}
          </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  );
};
