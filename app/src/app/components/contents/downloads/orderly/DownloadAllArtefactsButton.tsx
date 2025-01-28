import { Button } from "../../../Base/Button";
import { useParams } from "react-router-dom";
import { usePacketOutletContext } from "../../../main/PacketOutlet";
import { baseZipUrl, download } from "../../../../../lib/download";

export const DownloadAllArtefactsButton = () => {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();

  const artefactsFiles = packet?.custom?.orderly.artefacts.flatMap((art) => {
    return art.paths.map((path) => {
      return packet?.files.find((file) => file.path === path.replace("//", "/"));
    });
  });

  const downloadAllArtefacts = async () => {
    if (!packet || !packetId || !packetName || !artefactsFiles || artefactsFiles?.some((file) => file === undefined)) {
      throw new Error("Error retrieving artefact files");
    }
    const hashes = artefactsFiles.map((file) => file!.hash);
    const filenames = artefactsFiles.map((file) => file!.path);
    const url = `${baseZipUrl(packetName, packetId)}?hashes=${hashes?.join(",")}&filenames=${filenames?.join(",")}`;
    await download(url, `${packetName}_artefacts_${packetId}.zip`);
  };

  return (
    <Button onClick={downloadAllArtefacts} variant="ghost" className="h-fit w-fit">
      Download all artefacts as .zip
    </Button>
  );
};
