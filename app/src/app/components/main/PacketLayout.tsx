import { Loader2 } from "lucide-react";
import { Outlet, useOutletContext, useParams } from "react-router-dom";
import { PacketNameError } from "../../../lib/errors";
import { HttpStatus } from "../../../lib/types/HttpStatus";
import { PacketMetadata } from "../../../types";
import { ErrorPage } from "../contents/common/ErrorPage";
import { Sidebar } from "../contents/common/Sidebar";
import { Unauthorized } from "../contents/common/Unauthorized";
import { useUser } from "../providers/UserProvider";
import { useGetPacketById } from "./hooks/useGetPacketById";
import { useGetRunTaskIdByPacketId } from "./hooks/useGetRunTaskIdByPacketId";
import { getSideBarNavItems } from "./utils/getSideBarNavItems";

export const PacketLayout = () => {
  const { packetName, packetId } = useParams();
  const { authorities } = useUser();
  const { packet, isLoading, error } = useGetPacketById(packetId);
  const { runTaskId } = useGetRunTaskIdByPacketId(packetId);

  if (error?.status === HttpStatus.Unauthorized) return <Unauthorized />;
  if (error) return <ErrorPage error={error} message="Error fetching packet details" />;

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (packet?.name !== packetName) {
    return <ErrorPage error={new PacketNameError()} message="Error fetching packet details" />;
  }

  return packet ? (
    <Sidebar sidebarItems={getSideBarNavItems(packetName, packetId, authorities, runTaskId)}>
      <Outlet context={{ packet }} />
    </Sidebar>
  ) : null;
};

interface PacketOutletContext {
  packet: PacketMetadata | undefined;
}
export const usePacketOutletContext = () => useOutletContext<PacketOutletContext>();
