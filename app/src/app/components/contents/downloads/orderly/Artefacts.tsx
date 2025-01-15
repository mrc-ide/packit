import { Card, CardContent, CardHeader } from "../../../Base/Card";
import { FileRow } from "../FileRow";
import { Artefact } from "../../../../../types";
import { FileGroupDownloadButton } from "./FileGroupDownloadButton";

interface ArtefactsProps {
  artefacts: Artefact[];
}

export const Artefacts = ({ artefacts }: ArtefactsProps) => {
  return (
    <ul className="space-y-4">
      {artefacts.map((artefact, key) => (
        <li key={key}>
          <Card>
            <CardHeader className="bg-muted p-2 ps-6 flex-row justify-between items-center space-y-0">
              <h3 className="">{artefact.description}</h3>
              <FileGroupDownloadButton />
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
};
