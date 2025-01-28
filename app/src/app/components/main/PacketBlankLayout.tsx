import { useParams } from "react-router-dom";
import { PacketOutlet } from "./PacketOutlet";

export const PacketBlankLayout = () => {
  const { packetId } = useParams();

  return <PacketOutlet packetId={packetId} />;
};
