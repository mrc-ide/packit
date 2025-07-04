import { PacketTable } from "./PacketTable";
import { useParams } from "react-router-dom";
import { HttpStatus } from "@lib/types/HttpStatus";
import { Unauthorized } from "../common/Unauthorized";
import { ErrorComponent } from "../common/ErrorComponent";
import { useGetPacketGroupDisplay } from "./hooks/useGetPacketGroupDisplay";
import { Skeleton } from "@components/Base/Skeleton";

export const PacketGroup = () => {
  const { packetName } = useParams();
  const { packetGroup, error, isLoading } = useGetPacketGroupDisplay(packetName as string);
  const displayName = packetGroup?.latestDisplayName;
  const description = packetGroup?.description;

  if (error?.status == HttpStatus.Unauthorized) return <Unauthorized />;
  if (!isLoading && (error || !packetGroup)) {
    return <ErrorComponent message="Error fetching packet group" error={error || new Error("Missing packet group")} />;
  }

  return (
    <div className="flex justify-center">
      <div className="h-full flex-1 flex-col p-8 max-w-7xl">
        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-4 mb-4">
            {isLoading ? (
              <Skeleton className="h-4 w-64" />
            ) : (
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{displayName || packetName}</h2>
                {displayName !== packetName && <p className="text-muted-foreground">{packetName}</p>}
              </div>
            )}
            {description && <p className="text-primary">{description}</p>}
          </div>
        </div>
        <PacketTable parentIsLoading={isLoading} />
      </div>
    </div>
  );
};
