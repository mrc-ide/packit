import { Card, CardContent, CardHeader } from "@components/Base/Card";
import { FileRow } from "../FileRow";
import { ZipDownloadButton } from "../ZipDownloadButton";
import { Artefact } from "@components/../../types";
import { usePacketOutletContext } from "@components/main/PacketLayout";
import { useParams } from "react-router-dom";
import { allArtefactsFilesForPacket, filesForArtefact } from "../utils/artefactFiles";

interface ArtefactsProps {
  artefacts: Artefact[];
}

export const Artefacts = ({ artefacts }: ArtefactsProps) => {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();
  if (!packet) return null;

  const allArtefactsFiles = allArtefactsFilesForPacket(packet);

  const artefactName = (artefact: Artefact, index: number, truncate = false) => {
    if (artefact.description) {
      return truncate ? artefact.description.substring(0, 20) : artefact.description;
    } else {
      return `artefact_${index + 1}`;
    }
  };

  return (
    <>
      {allArtefactsFiles && (
        <span className="self-end absolute top-3 right-8">
          <ZipDownloadButton
            packetId={packet.id}
            files={allArtefactsFiles}
            zipName={`${packetName}_artefacts_${packetId}.zip`}
            buttonText="Download all artefacts"
            variant="ghost"
          />
        </span>
      )}
      <ul className="space-y-2">
        {artefacts.map((artefact, key) => {
          const files = filesForArtefact(artefact, packet);
          return (
            <li key={key}>
              <Card>
                <CardHeader className="bg-muted p-2 ps-6 flex-row justify-between items-center space-y-0">
                  <h3 className="">{artefactName(artefact, key)}</h3>
                  {files.length > 1 && (
                    <ZipDownloadButton
                      packetId={packet.id}
                      files={files}
                      zipName={`${artefactName(artefact, key, true)}_${packet.id}.zip`}
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
