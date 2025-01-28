import { Card, CardContent } from "../../../Base/Card";
import { FileRow } from "../FileRow";
import { DownloadAllOtherFilesButton } from "./DownloadAllOtherFilesButton";
import { InputFile, InputFileType } from "../../../../../types";
import { usePacketOutletContext } from "../../../main/PacketOutlet";
import { getFileByPath } from "../utils/getFileByPath";

// 'Other files' are any files to display other than artefact groups.

interface OtherFilesProps {
  inputFiles: InputFile[];
}

export const OtherFiles = ({ inputFiles }: OtherFilesProps) => {
  const { packet } = usePacketOutletContext();
  if (!packet) return null;

  const inputsWithFileMetadata = inputFiles.map((input) => {
    return { ...input, file: getFileByPath(input.path, packet) };
  });

  return (
    <div className="flex flex-col gap-2">
      <span className="self-end absolute top-3 right-8">
        <DownloadAllOtherFilesButton />
      </span>
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
    </div>
  );
};
