import { useParams } from "react-router-dom";
import { download, getZipUrl } from "../../../../../lib/download";
import { Button } from "../../../Base/Button";
import { FolderDown, Loader2 } from "lucide-react";
import { usePacketOutletContext } from "../../../main/PacketOutlet";
import { FileMetadata } from "../../../../../types";
import { useState } from "react";
import { filesToSize } from "../../../../../helpers";

interface FileGroupDownloadButtonProps {
  files: FileMetadata[];
  zipName: string;
}

export const FileGroupDownloadButton = ({ files, zipName }: FileGroupDownloadButtonProps) => {
  const { packetId } = useParams();
  const { packet } = usePacketOutletContext();
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const downloadFiles = async () => {
    if (!packet || !packetId || !files) {
      return;
    }
    setDownloading(true);
    await download(getZipUrl(packetId, files), zipName)
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
      <Button
        onClick={downloadFiles}
        variant="outline"
        className="py-1 px-3 bg-gray-100 hover:bg-gray-50 h-fit"
        disabled={downloading}
      >
        {downloading && <Loader2 size={18} className="animate-spin" />}
        {!downloading && <FolderDown size={18} />}
        <span className="ps-2">Download ({filesToSize(files)})</span>
      </Button>
      <div className="text-red-500 text-right">{error}</div>
    </div>
  );
};
