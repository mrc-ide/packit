import { Card, CardContent, CardHeader } from "../../Base/Card";
import FileRow from "./FileRow";
import { Artefact, PacketMetadata } from "../../../../types";

interface ArtefactsProps {
  artefacts: Artefact[];
}

export default function Artefacts({ artefacts }: ArtefactsProps) {
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
                {artefact.paths.map((path, index) => (
                  <li className="border-t" key={index}>
                    <FileRow path={path} />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
