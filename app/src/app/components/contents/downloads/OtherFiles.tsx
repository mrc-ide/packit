import { Card, CardContent } from "../../Base/Card";
import FileRow from "./FileRow";
import { PacketMetadata } from "../../../../types";

// 'Other files' are any files to display other than artefact groups.

interface OtherFilesProps {
  paths: string[];
  packet: PacketMetadata;
}

export default function OtherFiles({ paths, packet }: OtherFilesProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <ul>
          {paths.map((path, index) => (<li key={index}>
            <FileRow path={path} packet={packet} />
          </li>))}
        </ul>
      </CardContent>
    </Card>
  );
};
