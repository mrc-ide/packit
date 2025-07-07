import { Skeleton } from "../../Base/Skeleton";
import { ErrorComponent } from "../common/ErrorComponent";
import { useGetPinnedPackets } from "../home/hooks/useGetPinnedPackets";
import { AddPinButton } from "./AddPinButton";
import { ManageablePin } from "./ManageablePin";

export const ManagePins = () => {
  const { packets: pinnedPackets, error, isLoading, mutate } = useGetPinnedPackets();

  if (error) return <ErrorComponent message="Error fetching pinned packets" error={error} />;

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  if (!pinnedPackets || pinnedPackets.length == 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold tracking-tight">Manage Pins</h2>
      <h3 className="text-lg font-medium">Current pins:</h3>
      <div className="pb-3">
        <div>
          {pinnedPackets?.map((packet) => (
            <div key={packet.id} className="mb-2">
              <ManageablePin packet={packet} mutate={mutate} />
            </div>
          ))}
        </div>
      </div>
      <AddPinButton mutate={mutate} />
    </div>
  );
};
