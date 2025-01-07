import { useParams } from "react-router-dom";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { PacketHeader } from "../packets";
import DownloadButton from "./DownloadButton";
import { Card, CardContent, CardHeader } from "../../Base/Card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../Base/Accordion";
import { Timer } from "lucide-react";
import { FileMetadata, Roles } from "../../../../types";

export default function Download() {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();
  const artefacts = packet?.custom.orderly.artefacts;
  const inputs = packet?.custom.orderly.role
    .filter((input) => [Roles.Resource, Roles.Shared].includes(input.role));

  const getFileMetadataByPath = (path: string) => {
    return packet?.files.filter((file) => file.path === path)[0];
  };

  return (
    <>
      <PacketHeader packetName={packetName ?? ""} packetId={packetId ?? ""} />

      {(artefacts || inputs) && (<Accordion type="multiple" defaultValue={["artefacts"]}>
        {artefacts && (<AccordionItem value="artefacts">
          <AccordionTrigger>
            <span className="flex gap-1 items-center">
              <Timer className="small-icon text-muted-foreground" />
              <h3>Artefacts</h3>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-1">
              {artefacts.map((artefact, key) => (
                <li key={key}>
                  <Card>
                    <CardHeader>
                      <h3>{artefact.description}</h3>
                    </CardHeader>
                    <CardContent>
                      <ul>
                        {artefact.paths.map((path: string, index) => {
                          const file = getFileMetadataByPath(path);
                          return (file && (<li key={index}>
                            <DownloadButton file={file} packetId={packetId ?? ""} />
                          </li>));
                        })}
                      </ul>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>)}
      </Accordion>)}

      <h1>Old layout (reuse for outpack?)</h1>
      <ul>
        {packet?.files.map((data, key) => (
          <li key={key}>
            <DownloadButton file={data} packetId={packetId ?? ""} />
          </li>
        ))}
      </ul>
    </>
  );
}
