import { useParams } from "react-router-dom";
import { baseZipUrl, download } from "../../../../../lib/download";
import { Button } from "../../../Base/Button";
import { FolderDown } from "lucide-react";
import { usePacketOutletContext } from "../../../main/PacketOutlet";
import { FileMetadata } from "../../../../../types";

interface FileGroupDownloadButtonProps {
  files: FileMetadata[];
  zipName: string;
}

export const FileGroupDownloadButton = ({ files, zipName }: FileGroupDownloadButtonProps) => {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();

  const downloadFiles = async () => {
    if (!packet || !packetId || !packetName || !files) {
      return;
    }
    const hashes = files.map((file) => file.hash);
    const filenames = files.map((file) => file.path);
    const url = `${baseZipUrl(packetName, packetId)}?hashes=${hashes?.join(",")}&filenames=${filenames?.join(",")}`;
    await download(url, zipName);
  };

  return (
    <Button onClick={downloadFiles} variant="outline" className="py-0.5 bg-gray-100 hover:bg-gray-50 h-fit">
      <FolderDown size={26} className="pe-2" /> Download as .zip
    </Button>
  );
};
