import { Skeleton } from "@components/Base/Skeleton";
import { HttpStatus } from "@lib/types/HttpStatus";
import { useParams } from "react-router-dom";
import { ErrorComponent } from "../common/ErrorComponent";
import { Unauthorized } from "../common/Unauthorized";
import { useGetPacketsInGroup } from "./hooks/useGetPacketsInGroup";
import { PacketDataTable } from "./PacketDataTable";

export const PacketGroup = () => {
  const { packetName } = useParams();
  const { packets, error, isLoading } = useGetPacketsInGroup(packetName);
  const displayName = packets?.[0].displayName;
  const description = packets?.[0].description;

  if (error?.status == HttpStatus.Unauthorized) return <Unauthorized />;
  if (error) {
    return <ErrorComponent message="Error fetching packets for group" error={error} />;
  }

  return (
    <div className="flex justify-center">
      <div className="h-full flex-1 flex-col p-8 max-w-7xl">
        <div className="space-y-2">
          {isLoading ? (
            <Skeleton className="h-10 w-64 mb-4" />
          ) : (
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{displayName || packetName}</h2>
              {displayName !== packetName && <p className="text-muted-foreground">{packetName}</p>}
            </div>
          )}
          {description && <p className="text-primary">{description}</p>}
        </div>
        {isLoading && (
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
        )}
        {packets && <PacketDataTable packets={packets} />}
      </div>
    </div>
  );
};
