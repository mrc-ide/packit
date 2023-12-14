import { useParams } from "react-router-dom";
import { PacketTable } from "./PacketTable";

export const PacketGroup = () => {
  const { packetName } = useParams();

  return (
    <div className="flex justify-center">
      <div className="h-full flex-1 flex-col space-y-8 p-8 max-w-7xl">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{packetName}</h2>
            <p className="text-muted-foreground">Here&apos;s a list of all packets for the {packetName} packet group</p>
          </div>
        </div>
        <PacketTable />
      </div>
    </div>
  );
};
