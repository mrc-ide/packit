import { PacketTable } from "./PacketTable";
import {useParams} from "react-router-dom";
import {useGetPacketGroupSummaries} from "../explorer/hooks/useGetPacketGroupSummaries";
import {HttpStatus} from "../../../../lib/types/HttpStatus";
import {Unauthorized} from "../common/Unauthorized";
import {ErrorComponent} from "../common/ErrorComponent";
import {useGetPacketById} from "../common/hooks/useGetPacketById";

export const PacketGroup = () => {
  const { packetGroupName } = useParams();
  const { packetGroupSummaries, error: packetGroupError } =
    useGetPacketGroupSummaries(0, 1, packetGroupName as string);
  const latestPacketId = packetGroupSummaries?.content[0]?.latestId;
  const { packet: latestPacket, error: packetError } = useGetPacketById(latestPacketId)
  const packetGroupDisplayName = packetGroupSummaries?.content[0]?.latestDisplayName || "";
  const latestDescription = latestPacket?.custom.orderly.description.long;

  if ([packetError?.status, packetGroupError?.status].includes(HttpStatus.Unauthorized)) return <Unauthorized />;
  if (packetGroupError || !packetGroupDisplayName) {
    const error = packetGroupError || new Error("No packet groups found");
    return <ErrorComponent message="Error fetching packet group" error={error} />;
  }
  if (packetError || !latestPacket) {
    const error = packetError || new Error("No packet found");
    return <ErrorComponent message="Error fetching packet" error={error} />;
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
