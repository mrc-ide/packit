import { useParams } from "react-router-dom";
import { getDateUTCString, getElapsedTime } from "../../../../helpers";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { PacketHeader } from "../packets";
import { MetadataListItem } from "./MetadataListItem";
import { Github, Timer } from "lucide-react";

export default function Metadata() {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();

  const startedTime = packet && getDateUTCString(packet.time);
  const elapsedTime = packet && getElapsedTime(packet.time);

  return (
    <>
      <PacketHeader packetName={packetName ?? ""} packetId={packetId ?? ""} />
      {packet && (
        <>
          <div className="space-y-3">
            {packet.git &&
              <span className="flex gap-1 items-center text-muted-foreground">
                <Timer className="small-icon"/>
                <h3 className="text-lg font-bold tracking-tight">Timings</h3>
              </span>
            }
            <ul className="ps-1 flex gap-10">
              {startedTime && <MetadataListItem label="Started" value={startedTime} />}
              {elapsedTime && <MetadataListItem label="Elapsed" value={elapsedTime} />}
            </ul>
          </div>
          {packet.git && (
            <>
              <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"/>
              <div className="space-y-3">
                <span className="flex gap-1 items-center text-muted-foreground">
                  <Github className="small-icon"/>
                  <h3 className="text-lg font-bold tracking-tight" data-testid="gitHeading">Git</h3>
                </span>
                <ul className="ps-1 flex flex-col space-y-3">
                  <MetadataListItem label="Branch" value={packet.git.branch}/>
                  <MetadataListItem label="Commit" value={packet.git.sha}/>
                  <li className="flex flex-col">
                    <span className="font-semibold mr-2">Remotes</span>
                      <ul className="ps-1 list-disc list-inside">
                        {packet.git.url?.map((url, index) => (
                          <li key={index} className="text-muted-foreground">
                            {url}
                          </li>
                        ))}
                      </ul>
                  </li>
                </ul>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
