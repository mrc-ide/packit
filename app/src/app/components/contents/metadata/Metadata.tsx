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
  const session = packet?.custom?.orderly?.session;
  const packages = session?.packages
    .sort((a, b) => a.package.localeCompare(b.package));

  return (
    <>
      <PacketHeader packetName={packetName ?? ""} packetId={packetId ?? ""} displayName={packet?.displayName} />
      {packet && (
        <>
          <Accordion type="multiple" defaultValue={["timings", "git"]}>
            <AccordionItem value="timings">
              <AccordionTrigger>
                <span className="flex gap-1 items-center">
                  <Timer className="small-icon text-muted-foreground" />
                  <h3>Timings</h3>
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
                    <span className="flex gap-1 items-center">
                      <Github className="small-icon text-muted-foreground" />
                      <h3 data-testid="gitHeading">Git</h3>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1">
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
                    <span className="flex gap-1 items-center">
                      <Monitor className="small-icon text-muted-foreground" />
                      <h3>Platform</h3>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1">
                      <MetadataListItem label="OS" value={session.platform.os} />
                      <MetadataListItem label="System" value={session.platform.system} />
                      <MetadataListItem label="Language" value={session.platform.version} />
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="packages">
                  <AccordionTrigger>
                    <span className="flex gap-1 items-center">
                      <Library className="small-icon text-muted-foreground" />
                      <h3>Packages</h3>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 overflow-y-auto max-h-80">
                      {packages?.map((pkg, index) => (
                        <MetadataListItem key={index} label={pkg.package} value={`${pkg.version}`} />
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
