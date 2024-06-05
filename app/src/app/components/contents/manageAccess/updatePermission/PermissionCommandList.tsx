import { CommandLoading } from "cmdk";
import { Check } from "lucide-react";
import useSWR from "swr";
import appConfig from "../../../../../config/appConfig";
import { cn } from "../../../../../lib/cn";
import { PermissionScope } from "../../../../../lib/constants";
import { fetcher } from "../../../../../lib/fetch";
import { Pageable } from "../../../../../types";
import { CommandEmpty, CommandGroup, CommandItem, CommandList } from "../../../Base/Command";

interface PermissionCommandListProps {
  scope: PermissionScope;
  scopeResource: { id: string; name: string };
  setScopeResource: (value: { id: string; name: string }) => void;
  filterName: string;
  setFilterName: (value: string) => void;
  setOpen: (value: boolean) => void;
}
interface Resource extends Pageable {
  content: {
    name: string;
    id: string | number;
  }[];
}

export const PermissionCommandList = ({
  scope,
  scopeResource,
  setScopeResource,
  filterName,
  setFilterName,
  setOpen
}: PermissionCommandListProps) => {
  const searchParam = scope === "tag" ? "tag" : `packets${scope === "packet" ? "" : `/${scope}`}`;
  const { data, isLoading, error } = useSWR<Resource>(
    scope !== "global" ? `${appConfig.apiUrl()}/${searchParam}?filterName=${filterName}` : null,
    (url: string) => fetcher({ url })
  );

  if (error) return <div>error fetching</div>;
  return (
    <CommandList>
      {isLoading && <CommandLoading>Loading {scope}s...</CommandLoading>}
      <CommandEmpty>No {scope} found.</CommandEmpty>
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
            />
            {scope === "packet" ? resource.id : resource.name}
          </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  );
};
