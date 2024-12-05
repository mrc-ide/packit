import { useParams } from "react-router-dom";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { PacketHeader } from "../packets";
import DownloadButton from "./DownloadButton";

export default function Download() {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();

  return (
    <>
      <PacketHeader displayName={packet?.displayName ?? ""} packetName={packetName ?? ""} packetId={packetId ?? ""} />
      <ul>
        {packet?.files.map((data, key) => (
          <li key={key}>
            <DownloadButton file={data} packetId={packetId ?? ""} />
          </li>
        ))}
      </ul>
    </>
  );
}
