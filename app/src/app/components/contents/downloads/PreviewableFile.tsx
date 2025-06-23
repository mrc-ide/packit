import { FileMetadata } from "../../../../types";
import { HoverCard } from "../../Base/HoverCard";
import { HoverCardContent, HoverCardTrigger } from "@radix-ui/react-hover-card";
import { useFileObjectUrl } from "./hooks/useFileObjectUrl";
import { ExternalLinkIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { usePacketOutletContext } from "../../main/PacketLayout";
import { ErrorComponent } from "../common/ErrorComponent";

interface PreviewableFileProps {
  file: FileMetadata;
  fileName: string | undefined;
}

export const PreviewableFile = ({ file, fileName }: PreviewableFileProps) => {
  const { packet } = usePacketOutletContext();

  // The img tag is destroyed and recreated when the hover card is closed and opened.
  // Use blob URL to cache the image file in browser memory in order to avoid having to fetch the file every time the
  // hover card closes and opens (which would create a noticeable latency).
  // Since the blob url is not revoked by the useFileObjectUrl hook until the component is unmounted, the file is
  // effectively cached while the img tag is not in the DOM, so we only need one one-time token.
  const { fileObjectUrl, error } = useFileObjectUrl(file, packet);

  if (error) return <ErrorComponent message="Error loading file" error={error} />;

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild={true}>
        <Link
          to={`/${packet?.name}/${packet?.id}/file/${file.path}`}
          target="_blank"
          className="flex truncate text-blue-500 hover:underline"
          // The default, undocumented behaviour on mousedown is to toggle the 'open' state some number of times,
          // depending whether it's already open. (There is another complicated undocumented reaction on click.)
          // We prevent that mousedown behaviour so that the HoverCard is closed when the link to a new tab is opened.
          onMouseDown={(e) => e.preventDefault()}
        >
          <span className="truncate">{fileName}</span>
          <ExternalLinkIcon size={15} className="min-w-fit ms-1" />
        </Link>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-80 bg-card border p-2 shadow relative left-14"
        align="start"
        sideOffset={10}
        style={{ zIndex: 1 }}
      >
        <img src={fileObjectUrl} alt={`Preview of the image download ${fileName}`} />
      </HoverCardContent>
    </HoverCard>
  );
};
