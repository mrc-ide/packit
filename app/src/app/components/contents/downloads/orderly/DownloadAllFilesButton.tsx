import { Button } from "../../../Base/Button";
import { FolderDown, Loader2 } from "lucide-react";
import { download, getZipUrl } from "../../../../../lib/download";
import { useParams } from "react-router-dom";
import { usePacketOutletContext } from "../../../main/PacketOutlet";
import { useState } from "react";
import { filesToSize } from "../../../../../helpers";

export const DownloadAllFilesButton = () => {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const downloadAllFiles = async () => {
    if (!packet || !packetId || !packetName || !packet.files) return;
    setDownloading(true);
    await download(getZipUrl(packetId, packet.files), `${packetName}_${packetId}.zip`)
      .then(() => setError(""))
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => {
        setDownloading(false);
      });
  };

  if (!packet) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={downloadAllFiles} variant="default" className="px-3 h-fit" disabled={downloading}>
        {downloading && <Loader2 size={18} className="animate-spin" />}
        {!downloading && <FolderDown size={18} />}
        <span className="ps-2">Download all files ({filesToSize(packet.files)})</span>
      </Button>
      <div className="text-red-500 text-right">{error}</div>
    </div>
  );
};
