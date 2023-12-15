import { useParams } from "react-router-dom";
import { getDateUTCString, getElapsedTime } from "../../../../helpers";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { PacketHeader } from "../packets";
import { MetadataListItem } from "./MetadataListItem";

export default function Metadata() {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();

  const startedTime = packet && getDateUTCString(packet.time);
  const elapsedTime = packet && getElapsedTime(packet.time);

  return (
    <div className="h-full flex-1 flex-col space-y-4 pl-8 lg:pl-0 pr-8">
      <PacketHeader packetName={packetName ?? ""} packetId={packetId ?? ""} />
      {packet && (
        <ul className="flex flex-col space-y-3">
          {startedTime && <MetadataListItem label="Started" value={startedTime} />}
          {elapsedTime && <MetadataListItem label="Elapsed" value={elapsedTime} />}
          {packet.git && (
            <>
              <MetadataListItem label="Git Branch" value={packet.git.branch} />
              <MetadataListItem label="Git Commit" value={packet.git.sha} />
              <li className="flex flex-col">
                <span className="font-semibold mr-2">Git Remotes</span>
                <ul className="list-disc list-inside">
                  {packet.git.url?.map((url, index) => (
                    <li key={index} className="text-muted-foreground">
                      {url}
                    </li>
                  ))}
                </ul>
              </li>
            </>
          )}
        </ul>
      )}
    </div>
  );
}
