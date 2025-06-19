import { Loader2 } from "lucide-react";
import { Outlet, useOutletContext, useParams } from "react-router-dom";
import { PacketMetadata } from "../../../types";
import { ErrorComponent } from "../contents/common/ErrorComponent";
import { useGetPacketById } from "./hooks/useGetPacketById";
import { HttpStatus } from "../../../lib/types/HttpStatus";
import { Unauthorized } from "../contents/common/Unauthorized";
import { PacketNameError } from "../../../lib/errors";
import { useGetRunTaskIdByPacketId } from "./hooks/useGetRunTaskIdByPacketId";

export const PacketOutlet = () => {
  const { packetName, packetId } = useParams();
  const { packet, isLoading, error } = useGetPacketById(packetId);
  const { runTaskId } = useGetRunTaskIdByPacketId(packetId);

  if (error?.status === HttpStatus.Unauthorized) return <Unauthorized />;
  if (error) return <ErrorComponent error={error} message="Error fetching packet details" />;

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (packet?.name !== packetName) {
    return <ErrorComponent error={new PacketNameError()} message="Error fetching packet details" />;
  }

  return packet ? <Outlet context={{ packet, runTaskId }} /> : null;
};

interface PacketOutletContext {
  packet: PacketMetadata | undefined;
  runTaskId: string | undefined;
}
export const usePacketOutletContext = () => useOutletContext<PacketOutletContext>();
