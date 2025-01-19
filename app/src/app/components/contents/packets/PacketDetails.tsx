import { useParams } from "react-router-dom";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { PacketHeader } from "./PacketHeader";
import { PacketParameters } from "./PacketParameters";
import { PacketReports } from "./PacketReports";
import { Separator } from "../../Base/Separator";

export const PacketDetails = () => {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();
  const longDescription = packet?.custom?.orderly.description.long;
  return (
    <>
      <PacketHeader packetName={packetName ?? ""} packetId={packetId ?? ""} displayName={packet?.displayName} />
      {longDescription && <p>{longDescription}</p>}
      <Separator className="mx-1" />
      <PacketParameters parameters={packet?.parameters ?? {}} />
      <PacketReports packet={packet} />
    </>
  );
};
