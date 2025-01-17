import { bytesToSize } from "../../../../helpers";
import { DownloadButton } from "./DownloadButton";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { ExtensionIcon } from "./ExtensionIcon";
import { isHtmlFile, isImageFile } from "./utils/extensions";
import { PreviewableFile } from "./PreviewableFile";
import { FileLink } from "./FileLink";
import { FileMetadata } from "../../../../types";

interface FileRowProps {
  file: FileMetadata;
  sharedResource?: boolean;
}

export const FileRow = ({ file, sharedResource }: FileRowProps) => {
  const { packet } = usePacketOutletContext();

  const fileName = file.path.split("/").pop();
  const isPreviewable = file && isImageFile(file);
  const isLinkable = file && isHtmlFile(file);

  if (!file || !packet) return null;
  return (
    <div className="p-2 flex justify-between">
      <div className="flex items-center truncate">
        <span className="min-w-fit">
          <ExtensionIcon path={file.path} />
        </span>
        <div className="flex flex-col ps-2 truncate">
          <span className="font-semibold truncate">
            {!isPreviewable && (
              <>
                {!isLinkable && <span>{fileName}</span>}
                {isLinkable && <FileLink file={file} fileName={fileName} />}
              </>
            )}
            {isPreviewable && <PreviewableFile file={file} fileName={fileName} />}
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
