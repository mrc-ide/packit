import { ChartColumn, File, Presentation, TableProperties } from "lucide-react";
import { bytesToSize } from "../../../../helpers";
import { PacketMetadata } from "../../../../types";
import DownloadButton from "./DownloadButton";

interface FileRowProps {
  path: string;
  packet: PacketMetadata;
}

export default function FileRow({ path, packet }: FileRowProps) {
  const extension = path.split(".").pop();
  const file = packet.files.filter((file) => {
    return file.path === path.replace("//", "/");
  })[0];
  const fileName = path.split("/").pop();

  return (
    <div className="p-2 flex justify-between">
      <div className="flex items-center truncate">
        <span className="min-w-fit">
          {extension && (() => {
            switch (true) {
              case ["pdf", "html", "ppt", "pptm", "pptx", "potx", "potm", "pps", "xps"].includes(extension):
                return <Presentation />;
              case ["csv", "xls", "xlsx", "xlsm", "xltx", "ods"].includes(extension):
                return <TableProperties />;
              case ["jpeg", "jpg", "png", "jiff", "bmp", "gif"].includes(extension):
                return <ChartColumn />;
              default:
                return <File className="text-gray-400" />;
            }
          })()}
        </span>
        <div className="flex flex-col ps-2 truncate">
          <span className="font-semibold truncate">{fileName}</span>
          <span className="small text-muted-foreground">{bytesToSize(file.size)}</span>
        </div>
      </div>
      <DownloadButton file={file} packetId={packet.id ?? ""} />
    </div>
  );
}
