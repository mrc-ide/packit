import { useGetPacketById } from "@components/main/hooks/useGetPacketById";
import { ApiError } from "@/lib/errors";
import { HttpStatus } from "@/lib/types/HttpStatus";
import { ErrorComponent } from "@components/contents/common/ErrorComponent";
import { CheckIcon, XIcon } from "lucide-react";
import { useGetPinnedPackets } from "@components/contents/common/hooks/useGetPinnedPackets";

interface PinCheckProps {
  packetId: string;
}
export const PinCheck = ({ packetId }: PinCheckProps) => {
  const { packet, isLoading, error } = useGetPacketById(packetId);
  const { packets: pinnedPackets } = useGetPinnedPackets();

  if (isLoading) return <p>Checking packet...</p>;

  // TODO: Update HttpStatus.BadRequest to HttpStatus.NotFound after https://github.com/mrc-ide/packit/pull/243 merged
  if (error instanceof ApiError && error.status === HttpStatus.BadRequest) {
    return (
      <p className="text-xs font-medium text-red-500">
        <XIcon size={15} className="inline mr-1 text-red-500" />
        No packet found with ID {packetId}
      </p>
    );
  }

  if (error) {
    return <ErrorComponent error={error} message="Error fetching packet details" />;
  }

  if (!packet) {
    return null;
  }

  if (pinnedPackets?.map((pin) => pin.id).includes(packetId)) {
    return (
      <p className="text-xs font-medium text-red-500">
        <XIcon size={15} className="inline mr-1 text-red-500" />
        Packet is already pinned: &lsquo;{packet.displayName || packet.name}&rsquo;
      </p>
    );
  }

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">
        <CheckIcon size={15} className="inline mr-1 text-green-500" />
        Matching unpinned packet found: &lsquo;{packet.displayName || packet.name}&rsquo;
      </p>
    </div>
  );
};
