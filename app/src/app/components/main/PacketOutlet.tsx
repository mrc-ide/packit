import { Loader2 } from "lucide-react";
import { Outlet, useOutletContext } from "react-router-dom";
import { PacketMetadata } from "../../../types";
import { ErrorComponent } from "../contents/common/ErrorComponent";
import { useGetPacketById } from "../contents/common/hooks/useGetPacketById";

interface PacketOutletProps {
  packetId: string | undefined;
}
export const PacketOutlet = ({ packetId }: PacketOutletProps) => {
  const { packet, isLoading, error } = useGetPacketById(packetId);

  if (error) {
    return <ErrorComponent error={error} message="Error Fetching Packet details" />;
  }

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    );

  return <>{packet && <Outlet context={{ packet }} />}</>;
};

interface PacketOutletContext {
  packet: PacketMetadata | undefined;
}
export const usePacketOutletContext = () => useOutletContext<PacketOutletContext>();
