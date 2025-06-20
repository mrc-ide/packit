import { bytesToSize } from "../../../../helpers";
import { FileDownloadButton } from "./FileDownloadButton";
import { usePacketOutletContext } from "../../main/PacketLayout";
import { ExtensionIcon } from "./ExtensionIcon";
import { isImageFile } from "./utils/extensions";
import { PreviewableFile } from "./PreviewableFile";
import { FileMetadata } from "../../../../types";

interface FileRowProps {
  file: FileMetadata;
  sharedResource?: boolean;
}

export const FileRow = ({ file, sharedResource }: FileRowProps) => {
  const { packet } = usePacketOutletContext();
  const fileName = file.path.split("/").pop();

  if (!file || !packet) return null;
  return (
    <div className="p-2 flex justify-between">
      <div className="flex items-center max-w-2xl truncate">
        <span className="min-w-fit">
          <ExtensionIcon path={file.path} />
        </span>
        <div className="flex flex-col ps-2 truncate">
          <span className="font-semibold truncate">
            {isImageFile(file) ? <PreviewableFile file={file} fileName={fileName} /> : <span>{fileName}</span>}
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
      <FileDownloadButton file={file} packetId={packet.id} />
    </div>
  );
};
