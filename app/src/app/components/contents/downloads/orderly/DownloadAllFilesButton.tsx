import { Button } from "../../../Base/Button";
import { FolderDown } from "lucide-react";
import { baseZipUrl, download } from "../../../../../lib/download";
import { useParams } from "react-router-dom";
import { usePacketOutletContext } from "../../../main/PacketOutlet";

export const DownloadAllFilesButton = () => {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();

  const downloadAllFiles = async () => {
    if (!packet || !packetId || !packetName || !packet.files) return;
    const hashes = packet.files.map((file) => file.hash);
    const filenames = packet.files.map((file) => file.path);
    const url = `${baseZipUrl(packetName, packetId)}?hashes=${hashes?.join(",")}&filenames=${filenames?.join(",")}`;
    await download(url, `${packetName}_${packetId}.zip`);
  };

  return (
    <Button onClick={downloadAllFiles} variant="default" className="py-1 h-fit">
      <FolderDown size={26} className="pe-2" /> Download all files as .zip
    </Button>
  );
};
