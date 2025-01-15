import { Card, CardContent } from "../../../Base/Card";
import FileRow from "../FileRow";
import { InputFiles, InputFileType } from "../../../../../types";

// 'Other files' are any files to display other than artefact groups.

interface OtherFilesProps {
  inputFiles: InputFiles[];
}

export default function OtherFiles({ inputFiles }: OtherFilesProps) {
  return (
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
  );
}
