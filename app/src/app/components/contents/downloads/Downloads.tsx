import { useParams } from "react-router-dom";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { PacketHeader } from "../packets";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../Base/Accordion";
import { Roles } from "../../../../types";
import Artefacts from "./Artefacts";
import OtherFiles from "./OtherFiles";

export default function Downloads() {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();
  const artefacts = packet?.custom?.orderly.artefacts;
  const inputsPaths = packet?.custom?.orderly.role
    .filter((input) => [Roles.Resource, Roles.Shared].includes(input.role))
    .map((input) => input.path);
  const packetIsFromOrderly = !!packet?.custom?.orderly;

  return (
    <>
      <PacketHeader packetName={packetName ?? ""} packetId={packetId ?? ""} displayName={packet?.displayName} />
      {packet && (<>
        {!packetIsFromOrderly ? (<>
          <h3>Downloads</h3>
          <OtherFiles paths={packet.files.map(file => file.path)} packet={packet} />
        </>) : (<>
          {!!artefacts?.length && !!inputsPaths?.length ? (
            <Accordion type="multiple" defaultValue={["artefacts"]}>
              {!!artefacts?.length && (<AccordionItem value="artefacts">
                <AccordionTrigger>
                  <h3>Artefacts</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <Artefacts artefacts={artefacts} packet={packet} />
                </AccordionContent>
              </AccordionItem>)}
              {!!inputsPaths?.length && (<AccordionItem value="inputs">
                <AccordionTrigger>
                  <h3>Other files</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <OtherFiles paths={inputsPaths} packet={packet} />
                </AccordionContent>
              </AccordionItem>)}
            </Accordion>
          ) : artefacts?.length ? (<>
            <h3>Artefacts</h3>
            <Artefacts artefacts={artefacts} packet={packet} />
          </>) : inputsPaths?.length ? (<>
            <h3>Files</h3>
            <OtherFiles paths={inputsPaths} packet={packet} />
          </>) : (
            <p>There are no artefacts or files to download for this packet.</p>
          )}
        </>)}
      </>)}
    </>
  );
}
