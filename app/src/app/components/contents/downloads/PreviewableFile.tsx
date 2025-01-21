import { FileMetadata } from "../../../../types";
import { HoverCard } from "../../Base/HoverCard";
import { HoverCardContent, HoverCardTrigger } from "@radix-ui/react-hover-card";
import { useFileObjectUrl } from "./hooks/useFileObjectUrl";
import { ExternalLinkIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { ErrorComponent } from "../common/ErrorComponent";

interface PreviewableFileProps {
  file: FileMetadata;
  fileName: string | undefined;
}

export const PreviewableFile = ({ file, fileName }: PreviewableFileProps) => {
  const { packet } = usePacketOutletContext();
  const { fileObjectUrl, error } = useFileObjectUrl(file);

  if (error) return <ErrorComponent message="Error loading file" error={error} />;

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild={true}>
        <Link
          to={`/${packet?.name}/${packet?.id}/file/${file.path}`}
          target="_blank"
          className="flex truncate text-blue-500 hover:underline"
        >
          <span className="truncate">{fileName}</span>
          <ExternalLinkIcon size={15} className="min-w-fit ms-1" />
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-card border p-2 shadow" align="start">
        <img src={fileObjectUrl} alt={`Preview of the image download ${fileName}`} />
      </HoverCardContent>
    </HoverCard>
  );
};
