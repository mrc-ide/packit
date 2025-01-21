import { Card, CardContent, CardHeader } from "../../../Base/Card";
import { FileRow } from "../FileRow";
import { Artefact, FileMetadata } from "../../../../../types";
import { usePacketOutletContext } from "../../../main/PacketOutlet";
import { getFileByPath } from "../utils/getFileByPath";

interface ArtefactsProps {
  artefacts: Artefact[];
}

export const Artefacts = ({ artefacts }: ArtefactsProps) => {
  const { packet } = usePacketOutletContext();
  if (!packet) return null;

  const filesForArtefact = (artefact: Artefact) =>
    artefact.paths.map((path) => getFileByPath(path, packet)).filter((file): file is FileMetadata => !!file);

  return (
    <ul className="space-y-4">
      {artefacts.map((artefact, key) => (
        <li key={key}>
          <Card>
            <CardHeader className="bg-muted p-4">
              <h3 className="">{artefact.description}</h3>
            </CardHeader>
            <CardContent className="p-0">
              <ul>
                {filesForArtefact(artefact).map((file, index) => (
                  <li className="border-t" key={index}>
                    <FileRow file={file} />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
};
