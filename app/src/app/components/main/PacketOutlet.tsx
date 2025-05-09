import { Loader2 } from "lucide-react";
import { Outlet, useOutletContext, useParams } from "react-router-dom";
import { PacketMetadata } from "../../../types";
import { ErrorComponent } from "../contents/common/ErrorComponent";
import { useGetPacketById } from "../contents/common/hooks/useGetPacketById";
import { HttpStatus } from "../../../lib/types/HttpStatus";
import { Unauthorized } from "../contents/common/Unauthorized";
import { PacketNameError } from "../../../lib/errors";

export const PacketOutlet = () => {
  const { packetName, packetId } = useParams();

  let packet: PacketMetadata | undefined;
  let isLoading = true;
  let error: any = null;

  try {
    const result = useGetPacketById(packetId, packetName);
    packet = result.packet;
    isLoading = result.isLoading;
    error = result.error;
  } catch (e) {
    if (e instanceof PacketNameError) {
      return <ErrorComponent error={e} message="Error fetching packet details" />;
    }
  }

  if (error?.status === HttpStatus.Unauthorized) return <Unauthorized />;
  if (error) return <ErrorComponent error={error} message="Error fetching packet details" />;

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    );

  return packet ? <Outlet context={{ packet }} /> : null;
};

interface PacketOutletContext {
  packet: PacketMetadata | undefined;
}
export const usePacketOutletContext = () => useOutletContext<PacketOutletContext>();
