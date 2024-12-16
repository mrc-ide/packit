import { useParams } from "react-router-dom";
import { getDateUTCString, getElapsedTime } from "../../../../helpers";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { PacketHeader } from "../packets";
import { MetadataListItem } from "./MetadataListItem";
import { Github, Library, Monitor, Timer } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "../../Base/Accordion";

export default function Metadata() {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();

  const startedTime = packet && getDateUTCString(packet.time);
  const elapsedTime = packet && getElapsedTime(packet.time);
  const session = packet?.custom.orderly.session;

  return (
    <>
      <PacketHeader packetName={packetName ?? ""} packetId={packetId ?? ""} />
      {packet && (
        <>
          <Accordion type="multiple" defaultValue={["timings", "git"]}>
            <AccordionItem value="timings">
              <AccordionTrigger>
                <span className="flex gap-1 items-center text-muted-foreground">
                  <Timer className="small-icon" />
                  <h3 className="text-lg font-bold tracking-tight">Timings</h3>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="ps-1 flex gap-10">
                  {startedTime && <MetadataListItem label="Started" value={startedTime} />}
                  {elapsedTime && <MetadataListItem label="Elapsed" value={elapsedTime} />}
                </ul>
              </AccordionContent>
            </AccordionItem>
            {packet.git && (
              <>
                <AccordionItem value="git">
                  <AccordionTrigger>
                     <span className="flex gap-1 items-center text-muted-foreground">
                       <Github className="small-icon" />
                       <h3 className="text-lg font-bold tracking-tight" data-testid="gitHeading">Git</h3>
                     </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="ps-1 flex flex-col space-y-3">
                      <MetadataListItem label="Branch" value={packet.git.branch} />
                      <MetadataListItem label="Commit" value={packet.git.sha} />
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
                  </AccordionContent>
                </AccordionItem>
              </>
            )}
            {session && (
              <>
                <AccordionItem value="platform">
                  <AccordionTrigger>
                    <span className="flex gap-1 items-center text-muted-foreground">
                      <Monitor className="small-icon" />
                      <h3 className="text-lg font-bold tracking-tight">Platform</h3>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <MetadataListItem label="OS" value={session.platform.os} />
                    <MetadataListItem label="System" value={session.platform.system} />
                    <MetadataListItem label="Version" value={session.platform.version} />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="packages">
                  <AccordionTrigger>
                    <span className="flex gap-1 items-center text-muted-foreground">
                      <Library className="small-icon" />
                      <h3 className="text-lg font-bold tracking-tight">Packages</h3>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="ps-1">
                      {packet.custom.orderly.session.packages
                        ?.sort((a, b) => a.package.localeCompare(b.package))
                        ?.map((pkg, index) => (
                          <MetadataListItem key={index} label={pkg.package}
                                            value={`${pkg.version}${pkg.attached ? " (attached)" : ""}`} />
                        ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </>
            )}
          </Accordion>
        </>
      )}
    </>
  );
}
