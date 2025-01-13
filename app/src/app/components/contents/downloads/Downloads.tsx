import { useParams } from "react-router-dom";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { PacketHeader } from "../packets";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../Base/Accordion";
import { Roles } from "../../../../types";
import Artefacts from "./Artefacts";
import OtherFiles from "./OtherFiles";
import { Card, CardContent } from "../../Base/Card";
import FileRow from "./FileRow";

export default function Downloads() {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();
  const artefacts = packet?.custom?.orderly.artefacts;
  const inputs = packet?.custom?.orderly.role
    .filter((input) => [Roles.Resource, Roles.Shared].includes(input.role));
  const packetIsFromOrderly = !!packet?.custom?.orderly;

  return (
    <>
      <PacketHeader packetName={packetName ?? ""} packetId={packetId ?? ""} displayName={packet?.displayName} />
      {packet && (<>
        {!packetIsFromOrderly ? (<>
          <h3>Downloads</h3>
          <Card>
            <CardContent className="p-0">
              <ul>
                {packet.files.map((file, index) => (<li key={index}>
                  <FileRow path={file.path} packet={packet} />
                </li>))}
              </ul>
            </CardContent>
          </Card>
        </>) : (<>
          {!!artefacts?.length && !!inputs?.length ? (
            <Accordion type="multiple" defaultValue={["artefacts"]}>
              {!!artefacts?.length && (<AccordionItem value="artefacts">
                <AccordionTrigger>
                  <h3>Artefacts</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <Artefacts artefacts={artefacts} packet={packet} />
                </AccordionContent>
              </AccordionItem>)}
              {!!inputs?.length && (<AccordionItem value="inputs">
                <AccordionTrigger>
                  <h3>Other files</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <OtherFiles inputs={inputs} packet={packet} />
                </AccordionContent>
              </AccordionItem>)}
            </Accordion>
          ) : artefacts?.length ? (<>
            <h3>Artefacts</h3>
            <Artefacts artefacts={artefacts} packet={packet} />
          </>) : inputs?.length ? (<>
            <h3>Files</h3>
            <OtherFiles inputs={inputs} packet={packet} />
          </>) : (
            <p>There are no artefacts or files to download for this packet.</p>
          )}
        </>)}
      </>)}
    </>
  );
}
