import { DownloadCloud } from "lucide-react";
import { useState } from "react";
import appConfig from "../../../../config/appConfig";
import { bytesToSize } from "../../../../helpers";
import { download } from "../../../../lib/download";
import { FileMetadata } from "../../../../types";
import { Button } from "../../Base/Button";

interface DownloadButtonProps {
  file: FileMetadata;
  packetId: string;
}

export default function DownloadButton({ file, packetId }: DownloadButtonProps) {
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
    <>
      <Button onClick={() => downloadFile(file)} variant="outline">
        {file.path}
        <span className="sidebar-icon p-2">
          <DownloadCloud />
        </span>
      </Button>
      <span className="small p-2 text-muted-foreground">({bytesToSize(file.size)})</span>
      <div className="text-red-500 h-6">{error}</div>
    </>
  );
}
