import { Card, CardContent } from "@components/Base/Card";
import { FileRow } from "../FileRow";
import { InputFile, InputFileType } from "@/types";
import { usePacketOutletContext } from "@components/main/PacketLayout";
import { getFileByPath } from "../utils/getFileByPath";

// 'Other files' are any files to display other than artefact groups.

interface OtherFilesProps {
  inputs: InputFile[];
}

export const OtherFiles = ({ inputs }: OtherFilesProps) => {
  const { packet } = usePacketOutletContext();
  if (!packet) return null;

  const inputsWithFileMetadata = inputs.map((input) => {
    return { ...input, file: getFileByPath(input.path, packet) };
  });

  return (
    <Card>
      <CardContent className="p-0">
        <ul>
          {inputsWithFileMetadata.map((input, index) => {
            return (
              input.file && (
                <li key={index} className="[&:not(:first-child)]:border-t">
                  <FileRow file={input.file} sharedResource={input.role === InputFileType.Shared} />
                </li>
              )
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};
