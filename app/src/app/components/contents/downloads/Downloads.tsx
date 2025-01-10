import { useParams } from "react-router-dom";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { PacketHeader } from "../packets";
import { Card, CardContent, CardHeader } from "../../Base/Card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../Base/Accordion";
import { Roles } from "../../../../types";
import FileRow from "./FileRow";

export default function Downloads() {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();
  const artefacts = packet?.custom.orderly.artefacts;
  const inputs = packet?.custom.orderly.role
    .filter((input) => [Roles.Resource, Roles.Shared].includes(input.role));

  const getFileMetadataByPath = (path: string) => packet?.files
    .filter((file) => file.path === path.replace("//", "/"))[0];

  return (
    <>
      <PacketHeader packetName={packetName ?? ""} packetId={packetId ?? ""} />
      {(!!artefacts?.length || !!inputs?.length) && (
        <Accordion type="multiple" defaultValue={["artefacts"]}>
          {!!artefacts?.length && (<AccordionItem value="artefacts">
            <AccordionTrigger>
              <h3>Artefacts</h3>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-4">
                {artefacts.map((artefact, key) => (
                  <li key={key}>
                    <Card>
                      <CardHeader className="bg-muted p-4">
                        <h3 className="">{artefact.description}</h3>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ul>
                          {artefact.paths.map((path: string, index) => {
                            const file = getFileMetadataByPath(path);
                            return (file && (<li className="border-t" key={index}>
                              <FileRow file={file} packetId={packetId ?? ""} />
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
          {!!inputs?.length && (<AccordionItem value="inputs">
            <AccordionTrigger>
              <h3>Other files</h3>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="p-0">
                  <ul>
                    {inputs.map((input, index) => {
                      const file = getFileMetadataByPath(input.path);
                      // return (file && (<li key={index}>{index}</li>));
                      return (file && (<li key={index}>
                        <FileRow file={file} packetId={packetId ?? ""} />
                      </li>));
                    })}
                  </ul>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>)}
        </Accordion>)}
      {!artefacts?.length && !inputs?.length && (
        <p>There are no artefacts or files to download for this packet.</p>)}
    </>
  );
}
