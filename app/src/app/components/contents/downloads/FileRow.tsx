import { bytesToSize } from "../../../../helpers";
import { DownloadButton } from "./DownloadButton";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { ExtensionIcon } from "./ExtensionIcon";
import { filePathToExtension, imageExtensions } from "./utils/extensions";
import { Link } from "react-router-dom";
import { ExternalLinkIcon } from "lucide-react";
import { HoverCard } from "../../Base/HoverCard";
import { HoverCardContent, HoverCardTrigger } from "@radix-ui/react-hover-card";
import { getFileObjectUrl, getFileUrl } from "../../../../lib/download";
import { useEffect, useState } from "react";

interface FileRowProps {
  path: string;
  sharedResource?: boolean;
}

export const FileRow = ({ path, sharedResource }: FileRowProps) => {
  const { packet } = usePacketOutletContext();
  const [fileObjectUrl, setFileObjectUrl] = useState<string | undefined>(undefined);

  const file = packet?.files.filter((file) => {
    return file.path === path.replace("//", "/");
  })[0];
  const fileName = path.split("/").pop();
  const isImageFile = imageExtensions.includes(filePathToExtension(path));

  useEffect(() => {
    if (file && packet && isImageFile) {
      const fileUrl = getFileUrl(file, packet.id);
      getFileObjectUrl(fileUrl, file.path).then(setFileObjectUrl);
    }
  }, [file, packet]);

  if (!file || !packet) return null;
  return (
    <div className="p-2 flex justify-between">
      <div className="flex items-center truncate">
        <span className="min-w-fit">
          <ExtensionIcon path={path} />
        </span>
        <div className="flex flex-col ps-2 truncate">
          <span className="font-semibold truncate">
            {!isImageFile && <span>{fileName}</span>}
            {isImageFile && fileObjectUrl && (
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
                  <img src={fileObjectUrl} alt="Preview of the image download" />
                </HoverCardContent>
              </HoverCard>
            )}
          </span>
          <p className="text-muted-foreground small">
            <span>{bytesToSize(file.size)}</span>
            {sharedResource && (
              <>
                <span> · </span>
                <span>Shared resource</span>
              </>
            )}
          </p>
        </div>
      </div>
      <DownloadButton file={file} packetId={packet.id} />
    </div>
  );
};
