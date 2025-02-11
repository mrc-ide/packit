import { FileDown } from "lucide-react";
import { useState } from "react";
import { download, getFileUrl } from "../../../../lib/download";
import { FileMetadata } from "../../../../types";
import { Button } from "../../Base/Button";

interface DownloadButtonProps {
  file: FileMetadata;
  packetId: string;
}

export const DownloadButton = ({ file, packetId }: DownloadButtonProps) => {
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const downloadFile = (file: FileMetadata) => {
    setDownloading(true);
    const url = getFileUrl(file, packetId);
    download(url, file.path)
      .then(() => setError(""))
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
          <FileDown />
        </span>
        Download
      </Button>
      <div className="text-red-500 pe-4">{error}</div>
    </div>
  );
};
