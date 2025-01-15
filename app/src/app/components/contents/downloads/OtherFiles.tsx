import { Card, CardContent } from "../../Base/Card";
import FileRow from "./FileRow";
import { PacketMetadata, Role, Roles } from "../../../../types";

// 'Other files' are any files to display other than artefact groups.

interface OtherFilesProps {
  inputFiles: Role[];
  packet: PacketMetadata;
}

export default function OtherFiles({ inputFiles, packet }: OtherFilesProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <ul>
          {inputFiles.map((input, index) => (
            <li key={index} className="[&:not(:first-child)]:border-t">
              <FileRow path={input.path} packet={packet} sharedResource={input.role === Roles.Shared} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
