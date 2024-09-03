import { Skeleton } from "../../Base/Skeleton";
import { ErrorComponent } from "../common/ErrorComponent";
import { useGetGitBranches } from "./hooks/useGetGitBranches";
import { PacketRunForm } from "./run/PacketRunForm";

export const PacketRun = () => {
  const { branchData, error, isLoading, mutate } = useGetGitBranches();

  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Run</h2>
        <p className="text-muted-foreground">Run a packet group to create a new packet</p>
      </div>
      {error && <ErrorComponent message="Error fetching branch information" error={error} />}
      {isLoading && (
        <ul className="">
          <li className="mb-8">
            <div className="flex space-x-2 mb-2">
              <Skeleton className="h-12 w-96" />
              <Skeleton className="h-12 w-12" />
            </div>
            <Skeleton className="h-8 w-56" />
          </li>
          <li className="mb-8 flex">
            <Skeleton className="h-12 w-96" />
          </li>
          <li className="mb-8 flex">
            <Skeleton className="h-12 w-96" />
          </li>
          <li className="mb-8 flex">
            <Skeleton className="h-12 w-24" />
          </li>
        </ul>
      )}
      {branchData && (
        <div className="max-w-[500px] mt-6">
          <PacketRunForm branches={branchData.branches} defaultBranch={branchData.defaultBranch} mutate={mutate} />
        </div>
      )}
    </div>
  );
};
