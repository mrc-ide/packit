import { PinnedPacket } from "./PinnedPacket";
import { useGetPinnedPackets } from "../common/hooks/useGetPinnedPackets";
import { ErrorComponent } from "../common/ErrorComponent";
import { Separator } from "@components/Base/Separator";
import { Skeleton } from "@components/Base/Skeleton";

export const Pins = () => {
  const { packets: pinnedPackets, error, isLoading } = useGetPinnedPackets();

  if (error) return <ErrorComponent message="Error fetching pinned packets" error={error} />;

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  if (!pinnedPackets || pinnedPackets.length == 0) return null;

  return (
    <div className="space-y-3" data-testid="pins">
      <h2 className="text-lg font-bold tracking-tight mb-6">Pinned packets</h2>
      <div className="overflow-x-auto pb-3">
        <div className="flex gap-3">
          {pinnedPackets?.map((packet) => <PinnedPacket key={packet.id} packet={packet} />)}
        </div>
      </div>
      <Separator />
    </div>
  );
};
