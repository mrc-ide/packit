import { DownloadCloud } from "lucide-react";
import {useEffect, useState} from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import appConfig from "../../../../config/appConfig";
import { bytesToSize } from "../../../../helpers";
import { FileMetadata, RootState, useAppDispatch } from "../../../../types";
import { actions } from "../../../store/packets/packetThunks";
import { PacketHeader } from "../packets";
import {Button} from "../../Base/Button";
import {download} from "../../../../lib/download";

export default function Download() {
  const { packet } = useSelector((state: RootState) => state.packets);
  const { isAuthenticated } = useSelector((state: RootState) => state.login);

  const dispatch = useAppDispatch();

  const { packetId } = useParams();
  const [error, setError] = useState("");

  useEffect(() => {
    if (packetId) {
      dispatch(actions.fetchPacketById(packetId));
    }
  }, [packetId]);

  const downloadFile = (file: FileMetadata) => {
    const url = `${appConfig.apiUrl()}/packets/file/${file.hash}?filename=${file.path}`;
    download(url, file.path, isAuthenticated)
        .catch(e =>  {
          console.log("ERROR")
          console.log(JSON.stringify(e.message))
          setError(e.message);
        })
        .then(() => setError(""));
  };

  if (Object.keys(packet).length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="content packet-details">
      <PacketHeader packet={packet} />
      <ul className="list-unstyled">
        {packet.files.map((data, key) => (
          <li key={key} className="pb-2">
            <div className="card custom-card">
              <div className="card-header">Download {data.path}</div>
              <div className="card-body">
                <Button onClick={() => downloadFile(data)} variant="outline">
                  {data.path}
                  <span className="sidebar-icon p-2">
                    <DownloadCloud />
                  </span>
                </Button>
                <span className="small p-2 text-muted">({bytesToSize(data.size)})</span>
                <div className="text-red-500">{error}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
