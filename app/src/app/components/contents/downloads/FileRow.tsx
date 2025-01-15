import { ChartColumn, File, Presentation, TableProperties } from "lucide-react";
import { bytesToSize } from "../../../../helpers";
import { PacketMetadata } from "../../../../types";
import DownloadButton from "./DownloadButton";
import { usePacketOutletContext } from "../../main/PacketOutlet";

interface FileRowProps {
  path: string;
  sharedResource?: boolean;
}

const presentationExtensions = ["pdf", "html", "ppt", "pptm", "pptx", "potx", "potm", "pps", "xps"];
const tableExtensions = ["csv", "xls", "xlsx", "xlsm", "xltx", "ods"];
const imageExtensions = ["jpeg", "jpg", "png", "jiff", "bmp", "gif"];
const defaultFileIcon = <File className="text-gray-400" />;

const getFileIcon = (extension: string | undefined) => {
  if (!extension) return defaultFileIcon;

  if (presentationExtensions.includes(extension)) return <Presentation />;
  if (tableExtensions.includes(extension)) return <TableProperties />;
  if (imageExtensions.includes(extension)) return <ChartColumn />;

  return defaultFileIcon;
};

export default function FileRow({ path, sharedResource }: FileRowProps) {
  const { packet } = usePacketOutletContext();
  const extension = path.split(".").pop();
  const file = packet?.files.filter((file) => {
    return file.path === path.replace("//", "/");
  })[0];

  const fileName = path.split("/").pop();

  if (!file || !packet) return null;
  return (
    <div className="p-2 flex justify-between">
      <div className="flex items-center truncate">
        <span className="min-w-fit">{getFileIcon(extension)}</span>
        <div className="flex flex-col ps-2 truncate">
          <span className="font-semibold truncate">{fileName}</span>
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
}
