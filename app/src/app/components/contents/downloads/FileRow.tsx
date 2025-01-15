import { bytesToSize } from "../../../../helpers";
import DownloadButton from "./DownloadButton";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { ExtensionIcon } from "./ExtensionIcon";

interface FileRowProps {
  path: string;
  sharedResource?: boolean;
}

export default function FileRow({ path, sharedResource }: FileRowProps) {
  const { packet } = usePacketOutletContext();
  const file = packet?.files.filter((file) => {
    return file.path === path.replace("//", "/");
  })[0];
  const fileName = path.split("/").pop();

  if (!file || !packet) return null;
  return (
    <div className="p-2 flex justify-between">
      <div className="flex items-center truncate">
        <span className="min-w-fit">
          <ExtensionIcon path={path} />
        </span>
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
