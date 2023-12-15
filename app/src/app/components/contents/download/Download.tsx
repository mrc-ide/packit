import { DownloadCloud } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import appConfig from "../../../../config/appConfig";
import { bytesToSize } from "../../../../helpers";
import { FileMetadata } from "../../../../types";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { PacketHeader } from "../packets";

export default function Download() {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();

  const download = (file: FileMetadata) => {
    return `${appConfig.apiUrl()}/packets/file/${file.hash}?filename=${file.path}`;
  };

  return (
    <div className="content packet-details">
      <PacketHeader packetName={packetName ?? ""} packetId={packetId ?? ""} />
      <ul className="list-unstyled">
        {packet?.files.map((data, key) => (
          <li key={key} className="pb-2">
            <div className="card custom-card">
              <div className="card-header">Download {data.path}</div>
              <div className="card-body">
                <Link className="card-text" to={download(data)}>
                  <span className="p-2">{data.path}</span>
                  <span className="sidebar-icon">
                    <DownloadCloud />
                  </span>
                </Link>
                <span className="small p-2 text-muted">({bytesToSize(data.size)})</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
