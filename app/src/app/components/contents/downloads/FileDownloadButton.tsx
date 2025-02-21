import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { getFilePublicUrl, getFileOttUrl, download } from "../../../../lib/download";
import { FileMetadata } from "../../../../types";
import { Button } from "../../Base/Button";
import { getAuthHeader } from "../../../../lib/auth/getAuthHeader";

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
    const oneTimeTokenUrl = getFileOttUrl(file, packetId);
    const headers = getAuthHeader();
    const res = await fetch(oneTimeTokenUrl, { method: "POST", headers }).catch((e) => {
      setError("Error with ott-doing.");
      setDownloading(false);
      throw new Error(`Error doing ott: ${e}`);
    });

    const json = await res.json();

    if (!res.ok) {
      const msg = json.error?.detail ? `Error: ${json.error.detail}` : `Error downloading ${file.path}`;
      setError("Error with ott-doing - response not ok");
      setDownloading(false);
      throw new Error(msg);
    }

    const token = json.id;
    const fileUrl = getFilePublicUrl(file, packetId, token);
    await download(fileUrl, file.path);
    setDownloading(false);
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
