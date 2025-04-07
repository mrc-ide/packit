import { Card, CardContent, CardHeader } from "../../../Base/Card";
import { FileRow } from "../FileRow";
import { ZipDownloadButton } from "../ZipDownloadButton";
import { Artefact, FileMetadata } from "../../../../../types";
import { usePacketOutletContext } from "../../../main/PacketOutlet";
import { getFileByPath } from "../utils/getFileByPath";
import { useParams } from "react-router-dom";

interface ArtefactsProps {
  artefacts: Artefact[];
}

export const Artefacts = ({ artefacts }: ArtefactsProps) => {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();
  if (!packet) return null;

  const filesForArtefact = (artefact: Artefact) =>
    artefact.paths.map((path) => getFileByPath(path, packet)).filter((file): file is FileMetadata => !!file);

  const allArtefactsFiles = packet?.custom?.orderly.artefacts.flatMap((art): FileMetadata[] => {
    return filesForArtefact(art);
  });

  return (
    <>
      {artefacts.length > 1 && allArtefactsFiles && (
        <span className="self-end absolute top-3 right-8">
          <ZipDownloadButton
            files={allArtefactsFiles}
            zipName={`${packetName}_artefacts_${packetId}.zip`}
            buttonText="Download all artefacts"
            variant="ghost"
          />
        </span>
      )}
      <ul className="space-y-2">
        {artefacts.map((artefact, key) => {
          const files = filesForArtefact(artefact);
          return (
            <li key={key}>
              <Card>
                <CardHeader className="bg-muted p-2 ps-6 flex-row justify-between items-center space-y-0">
                  <h3 className="">{artefact.description}</h3>
                  {files.length > 1 && (
                    <ZipDownloadButton
                      files={files}
                      zipName={`${artefact.description.substring(0, 20)}_${packet.id}.zip`}
                      variant="outline"
                      className="py-1"
                    />
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  <ul>
                    {files.map((file, index) => (
                      <li className="border-t" key={index}>
                        <FileRow file={file} />
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </>
  );
};
