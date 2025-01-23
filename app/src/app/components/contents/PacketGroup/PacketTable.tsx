import { useParams } from "react-router-dom";
import { HttpStatus } from "../../../../lib/types/HttpStatus";
import { Skeleton } from "../../Base/Skeleton";
import { ErrorComponent } from "../common/ErrorComponent";
import { Unauthorized } from "../common/Unauthorized";
import { useGetPacketPage } from "./hooks/useGetPacketPage";
import { PacketDataTable } from "./PacketDataTable";

export const PacketTable = ({ parentIsLoading }: { parentIsLoading: boolean }) => {
  const { packetName } = useParams();
  const { packets, error, isLoading } = useGetPacketPage(packetName);

  if (error?.status === HttpStatus.Unauthorized) return <Unauthorized />;
  if (error) return <ErrorComponent message="Error fetching packets" error={error} />;

  if (isLoading || parentIsLoading)
    return (
      <ul className="flex flex-col border rounded-md">
        {[...Array(2)].map((_val, index) => (
          <li key={index} className="p-4 flex border-b space-y-1 justify-between">
            <div className="flex flex-col space-y-1">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-2 w-48" />
            </div>
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-64" />
          </li>
        ))}
      </ul>
    );

  return packets ? <PacketDataTable packets={packets} /> : null;
};
