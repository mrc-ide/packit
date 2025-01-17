import { PacketMetadata } from "../../../../types";
import { HoverCard } from "../../Base/HoverCard";
import { HoverCardContent, HoverCardTrigger } from "@radix-ui/react-hover-card";
import { Link } from "react-router-dom";
import { ExternalLinkIcon } from "lucide-react";
import { useFileObjectUrl } from "./hooks/useFileObjectUrl";

interface ImageFileLabelProps {
  packet: PacketMetadata;
  file: any;
  fileName: string | undefined;
}

export const ImageFileLabel = ({ packet, file, fileName }: ImageFileLabelProps) => {
  const fileObjectUrl = useFileObjectUrl(packet, file);

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger>
        <Link
          to={`/${packet.name}/${packet.id}/file/${file.hash}`}
          target="_blank"
          className="flex truncate text-blue-500 hover:underline"
        >
          <span className="truncate">{fileName}</span>
          <ExternalLinkIcon size={15} className="min-w-fit ms-1" />
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="w-60 bg-card border p-2" align="start">
        {fileObjectUrl && <img src={fileObjectUrl} alt="Preview of the image download" />}
      </HoverCardContent>
    </HoverCard>
  );
};
