import { Card, CardContent } from "../../../Base/Card";
import { FileRow } from "../FileRow";
import { InputFiles, InputFileType } from "../../../../../types";
import { DownloadAllOtherFilesButton } from "./DownloadAllOtherFilesButton";

// 'Other files' are any files to display other than artefact groups.

interface OtherFilesProps {
  inputFiles: InputFiles[];
}

export const OtherFiles = ({ inputFiles }: OtherFilesProps) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="self-end absolute top-3 right-8">
        <DownloadAllOtherFilesButton />
      </span>
      <Card>
        <CardContent className="p-0">
          <ul>
            {inputFiles.map((input, index) => (
              <li key={index} className="[&:not(:first-child)]:border-t">
                <FileRow path={input.path} sharedResource={input.role === InputFileType.Shared} />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
