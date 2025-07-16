import { PinnedPacket } from "./PinnedPacket";
import { useGetPinnedPackets } from "../common/hooks/useGetPinnedPackets";
import { ErrorComponent } from "../common/ErrorComponent";
import { Separator } from "@components/Base/Separator";
import { Skeleton } from "@components/Base/Skeleton";
import { PinIcon } from "lucide-react";

export const Pins = () => {
  const { packets: pinnedPackets, error, isLoading } = useGetPinnedPackets();

  if (error) return <ErrorComponent message="Error fetching pinned packets" error={error} />;

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  if (!pinnedPackets || pinnedPackets.length == 0) return null;

  const anyPinnedPacketsInSameGroup = pinnedPackets.some((packet, index) =>
    pinnedPackets.some((otherPacket, otherIndex) => index !== otherIndex && packet.name === otherPacket.name)
  );

  return (
    <div className="space-y-3" data-testid="pins">
      <div className="flex items-center gap-2 mb-6">
        <PinIcon size={18} className="opacity-50"></PinIcon>
        <h2 className="text-lg font-bold tracking-tight">Pinned packets</h2>
      </div>
      <div className="overflow-x-auto pb-3">
        <div className="flex gap-3">
          {pinnedPackets?.map((packet) => (
            <PinnedPacket key={packet.id} packet={packet} showPacketId={anyPinnedPacketsInSameGroup} />
          ))}
        </div>
      </div>
      <Separator />
    </div>
  );
};
