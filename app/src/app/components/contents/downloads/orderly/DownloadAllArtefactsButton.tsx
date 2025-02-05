import { Button } from "../../../Base/Button";
import { useParams } from "react-router-dom";
import { usePacketOutletContext } from "../../../main/PacketOutlet";
import { download, getZipUrl } from "../../../../../lib/download";
import { getFileByPath } from "../utils/getFileByPath";
import { useState } from "react";
import { FolderDown, Loader2 } from "lucide-react";
import { filesToSize } from "../../../../../helpers";
import { FileMetadata } from "../../../../../types";

export const DownloadAllArtefactsButton = () => {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const artefactsFiles = packet?.custom?.orderly.artefacts.flatMap((art): FileMetadata[] => {
    return art.paths
      .map((path) => getFileByPath(path, packet))
      .filter((file): file is FileMetadata => file !== undefined);
  });

  const downloadAllArtefacts = async () => {
    if (!packet || !packetId || !packetName || !artefactsFiles) {
      throw new Error("Error retrieving artefact files");
    }
    setDownloading(true);
    await download(getZipUrl(packetId, artefactsFiles), `${packetName}_artefacts_${packetId}.zip`)
      .then(() => setError(""))
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => {
        setDownloading(false);
      });
  };

  if (!artefactsFiles) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={downloadAllArtefacts} variant="ghost" className="px-3 h-fit" disabled={downloading}>
        {downloading && <Loader2 size={18} className="animate-spin" />}
        {!downloading && <FolderDown size={18} />}
        <span className="ps-2">Download all artefacts ({filesToSize(artefactsFiles)})</span>
      </Button>
      <div className="text-red-500 text-right">{error}</div>
    </div>
  );
};
