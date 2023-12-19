import { useParams } from "react-router-dom";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { PacketHeader } from "../packets";
import DownloadButton from "./DownloadButton";

export default function Download() {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();

  return (
    <div className="content packet-details">
      <PacketHeader packetName={packetName ?? ""} packetId={packetId ?? ""} />
      <ul className="list-unstyled">
        {packet?.files.map((data, key) => (
          <li key={key} className="pb-2">
            <div className="card custom-card">
              <div className="card-header">Download {data.path}</div>
              <div className="card-body">
                <DownloadButton file={data}></DownloadButton>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
