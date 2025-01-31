import { Button } from "../../../Base/Button";
import { useParams } from "react-router-dom";
import { usePacketOutletContext } from "../../../main/PacketOutlet";
import { baseZipUrl, download } from "../../../../../lib/download";
import { getFileByPath } from "../utils/getFileByPath";

export const DownloadAllOtherFilesButton = () => {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();

  const downloadFiles = async () => {
    if (!packet || !packetId || !packetName) return;
    const artefactFilePaths = packet.custom?.orderly.artefacts.flatMap((art) => {
      // Route through getFileByPath for "//" substitution
      return art.paths.map((path) => getFileByPath(path, packet)?.path);
    });
    if (!artefactFilePaths) return;
    const files = packet.files.filter((file) => !artefactFilePaths.includes(file.path));
    const hashes = files.map((file) => file.hash);
    const filenames = files.map((file) => file.path);
    const url = `${baseZipUrl(packetName, packetId)}?hashes=${hashes?.join(",")}&filenames=${filenames?.join(",")}`;
    await download(url, `${packetName}_other_resources_${packetId}.zip`);
  };

  return (
    <Button onClick={downloadFiles} variant="ghost" className="h-fit w-fit">
      Download as .zip
    </Button>
  );
};
