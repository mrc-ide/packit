import { Card, CardContent } from "../../../Base/Card";
import { FileRow } from "../FileRow";
import { InputFiles, InputFileType } from "../../../../../types";
import { usePacketOutletContext } from "../../../main/PacketOutlet";
import { getFileByPath } from "../utils/getFileByPath";

// 'Other files' are any files to display other than artefact groups.

interface OtherFilesProps {
  inputFiles: InputFiles[];
}

export const OtherFiles = ({ inputFiles }: OtherFilesProps) => {
  const { packet } = usePacketOutletContext();

  return (
    <Card>
      <CardContent className="p-0">
        <ul>
          {packet &&
            inputFiles.map((input, index) => {
              const file = getFileByPath(input.path, packet);
              return (
                file && (
                  <li key={index} className="[&:not(:first-child)]:border-t">
                    <FileRow file={file} sharedResource={input.role === InputFileType.Shared} />
                  </li>
                )
              );
            })}
        </ul>
      </CardContent>
    </Card>
  );
};
