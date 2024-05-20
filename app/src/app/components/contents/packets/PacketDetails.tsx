import { useParams } from "react-router-dom";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import PacketHeader from "./PacketHeader";
import { PacketParameters } from "./PacketParameters";
import { PacketReports } from "./PacketReports";

export default function PacketDetails() {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();

  return (
    <>
      <PacketHeader packetName={packetName ?? ""} packetId={packetId ?? ""} />
      <PacketParameters parameters={packet?.parameters ?? {}} />
      <PacketReports packet={packet} />
    </>
  );
}
