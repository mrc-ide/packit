import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { download } from "../../../../lib/download";
import { FileMetadata } from "../../../../types";
import { Button } from "../../Base/Button";

interface FileDownloadButtonProps {
  file: FileMetadata;
  packetId: string;
}

export const FileDownloadButton = ({ file, packetId }: FileDownloadButtonProps) => {
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const downloadFile = async (file: FileMetadata) => {
    setDownloading(true);
    setError("");
    await download(file, packetId)
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => {
        setDownloading(false);
      });
  };

  return (
    <div className="flex flex-col items-end">
      <Button
        onClick={() => downloadFile(file)}
        variant="link"
        className="text-blue-500 py-0 pt-0"
        disabled={downloading}
      >
        <span className="px-1">
          {downloading && <Loader2 size={18} className="animate-spin" />}
          {!downloading && <FileDown size={18} />}
        </span>
        Download
      </Button>
      <div className="text-red-500 pe-4">{error}</div>
    </div>
  );
};
