import { FileMetadata } from "../../../../types";
import { HoverCard } from "../../Base/HoverCard";
import { HoverCardContent, HoverCardTrigger } from "@radix-ui/react-hover-card";
import { useFileObjectUrl } from "./hooks/useFileObjectUrl";
import { FileLink } from "./FileLink";

interface PreviewableFileProps {
  file: FileMetadata;
  fileName: string | undefined;
}

export const PreviewableFile = ({ file, fileName }: PreviewableFileProps) => {
  const fileObjectUrl = useFileObjectUrl(file);

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild={true}>
        <div>
          <FileLink file={file} fileName={fileName} />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-card border p-2" align="start">
        <img src={fileObjectUrl} alt={`Preview of the image download ${fileName}`} />
      </HoverCardContent>
    </HoverCard>
  );
};
