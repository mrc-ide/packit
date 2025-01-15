import { FileDown } from "lucide-react";
import { useState } from "react";
import appConfig from "../../../../config/appConfig";
import { download } from "../../../../lib/download";
import { FileMetadata } from "../../../../types";
import { Button } from "../../Base/Button";

interface DownloadButtonProps {
  file: FileMetadata;
  packetId: string;
}

export const DownloadButton = ({ file, packetId }: DownloadButtonProps) => {
  const [error, setError] = useState("");

  const downloadFile = (file: FileMetadata) => {
    const url = `${appConfig.apiUrl()}/packets/file/${packetId}?hash=${file.hash}&filename=${file.path}`;
    download(url, file.path)
      .then(() => setError(""))
      .catch((e) => {
        setError(e.message);
      });
  };

  return (
    <div className="flex flex-col items-end">
      <Button onClick={() => downloadFile(file)} variant="link" className="text-blue-500 py-0 pt-0">
        <span className="px-1">
          <FileDown />
        </span>
        Download
      </Button>
      <div className="text-red-500 pe-4">{error}</div>
    </div>
  );
};
