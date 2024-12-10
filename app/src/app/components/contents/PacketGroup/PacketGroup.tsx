import { PacketTable } from "./PacketTable";
import { useParams } from "react-router-dom";
import { HttpStatus } from "../../../../lib/types/HttpStatus";
import { Unauthorized } from "../common/Unauthorized";
import { ErrorComponent } from "../common/ErrorComponent";
import { useGetPacketById } from "../common/hooks/useGetPacketById";
import { useGetPacketGroupLatestIdAndDisplayName } from "./hooks/useGetPacketGroupLatestIdAndDisplayName";
import { Skeleton } from "../../Base/Skeleton";

export const PacketGroup = () => {
  const { packetName } = useParams();
  const {
    packetGroup,
    error: packetGroupError,
    isLoading: packetGroupIsLoading
  } = useGetPacketGroupLatestIdAndDisplayName(packetName as string);
  const packetGroupDisplayName = packetGroup?.displayName;
  const {
    packet: latestPacket,
    error: packetError,
    isLoading: packetIsLoading
  } = useGetPacketById(packetGroup?.latestPacketId);
  const latestDescription = latestPacket?.custom?.orderly.description.long;

  const isLoading = (packetGroupIsLoading || packetIsLoading);
  if ([packetError?.status, packetGroupError?.status].includes(HttpStatus.Unauthorized)) return <Unauthorized />;
  if (!isLoading && (packetGroupError || !packetGroup)) {
    const error = packetGroupError || new Error("No packet groups found");
    return <ErrorComponent message="Error fetching packet group" error={error} />;
  }
  if (!isLoading && (packetError || !latestPacket)) {
    const error = packetError || new Error("No packet found");
    return <ErrorComponent message="Error fetching packet" error={error} />;
  }

  return (
    <div className="flex justify-center">
      <div className="h-full flex-1 flex-col p-8 max-w-7xl">
        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-4 mb-4">
            {isLoading ? (<Skeleton className="h-4 w-64" />) : (<div>
              <h2 className="text-2xl font-bold tracking-tight">{packetGroupDisplayName || packetName}</h2>
              {packetGroupDisplayName !== packetName &&
                <p className="text-muted-foreground">{packetName}</p>
              }
            </div>)}
            {latestDescription && <p className="text-primary">{latestDescription}</p>}
          </div>
        </div>
        <PacketTable parentIsLoading={isLoading} />
      </div>
    </div>
  );
};
