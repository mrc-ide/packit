import { Button } from "../../../Base/Button";
import { useParams } from "react-router-dom";
import { usePacketOutletContext } from "../../../main/PacketOutlet";
import { download, getZipUrl } from "../../../../../lib/download";
import { getFileByPath } from "../utils/getFileByPath";
import { useState } from "react";
import { FolderDown, Loader2 } from "lucide-react";
import { filesToSize } from "../../../../../helpers";

// 'Other' files are those that are not artefacts

export const DownloadAllOtherFilesButton = () => {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const artefactFilePaths = packet?.custom?.orderly.artefacts.flatMap((art) => {
    // Route through getFileByPath for "//" substitution
    return art.paths.map((path) => getFileByPath(path, packet)?.path);
  });
  if (!artefactFilePaths) return null;
  const files = packet?.files.filter((file) => !artefactFilePaths.includes(file.path));
  if (!files) return null;

  const downloadFiles = async () => {
    if (!packet || !packetId || !packetName || !files) return;
    setDownloading(true);
    await download(getZipUrl(packetId, files), `${packetName}_other_resources_${packetId}.zip`)
      .then(() => setError(""))
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => {
        setDownloading(false);
      });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={downloadFiles} variant="ghost" className="px-3 h-fit" disabled={downloading}>
        {downloading && <Loader2 size={18} className="animate-spin" />}
        {!downloading && <FolderDown size={18} />}
        <span className="ps-2">Download ({filesToSize(files)})</span>
      </Button>
      <div className="text-red-500 text-right">{error}</div>
    </div>
  );
};
