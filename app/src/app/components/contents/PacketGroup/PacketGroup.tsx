import { PacketTable } from "./PacketTable";
import {useParams} from "react-router-dom";
import {useGetPacketGroupSummaries} from "../explorer/hooks/useGetPacketGroupSummaries";
import {HttpStatus} from "../../../../lib/types/HttpStatus";
import {Unauthorized} from "../common/Unauthorized";
import {ErrorComponent} from "../common/ErrorComponent";
import {useGetPacketById} from "../common/hooks/useGetPacketById";

export const PacketGroup = () => {
  const { packetGroupName } = useParams();
  const { packetGroupSummaries, error: packetGroupError, isLoading: packetGroupLoading } =
    useGetPacketGroupSummaries(0, 1, packetGroupName as string);
  const latestPacketId = packetGroupSummaries?.content[0]?.latestId;
  const { packet: latestPacket, error: packetError, isLoading: packetLoading } = useGetPacketById(latestPacketId)
  const isLoading = packetGroupLoading || packetLoading || latestPacketId === undefined;
  const packetGroupDisplayName = packetGroupSummaries?.content[0]?.latestDisplayName || "";
  const latestDescription = latestPacket?.custom.orderly.description.long;

  if (isLoading) return <p>Loading</p>;
  if ([packetError?.status, packetGroupError?.status].includes(HttpStatus.Unauthorized)) return <Unauthorized />;
  if (packetGroupError) return <ErrorComponent message="Error fetching packet groups" error={packetGroupError} />;
  if (!packetGroupDisplayName) {
    return <ErrorComponent message="Error fetching packet group" error={new Error("No packet groups found")} />;
  }
  if (packetError) return <ErrorComponent message="Error fetching packet" error={packetError} />;
  if (!latestPacket) {
    return <ErrorComponent message="Error fetching packet" error={new Error("No packet found")} />;
  }

  return (
    <div className="flex justify-center">
      <div className="h-full flex-1 flex-col p-8 max-w-7xl">
        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{packetGroupDisplayName}</h2>
              <p className="text-muted-foreground">{packetGroupName}</p>
            </div>
            {latestDescription && <p className="text-primary">{latestDescription}</p>}
            <p className="text-primary">
              Here&apos;s a list of all packets for the packet group &lsquo;{packetGroupDisplayName}&rsquo;:
            </p>
          </div>
        </div>
        <PacketTable/>
      </div>
    </div>
  );
};
