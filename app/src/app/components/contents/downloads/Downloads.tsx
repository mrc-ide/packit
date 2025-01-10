import { useParams } from "react-router-dom";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { PacketHeader } from "../packets";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../Base/Accordion";
import { Roles } from "../../../../types";
import Artefacts from "./Artefacts";
import Inputs from "./Inputs";

export default function Downloads() {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();
  const artefacts = packet?.custom?.orderly.artefacts;
  const inputs = packet?.custom?.orderly.role
    .filter((input) => [Roles.Resource, Roles.Shared].includes(input.role));

  return (
    <>
      <PacketHeader packetName={packetName ?? ""} packetId={packetId ?? ""} displayName={packet?.displayName} />
      {packet && (<>
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
                <Inputs inputs={inputs} packet={packet} />
              </AccordionContent>
            </AccordionItem>)}
          </Accordion>
        ) : artefacts?.length ? (<>
          <h3>Artefacts</h3>
          <Artefacts artefacts={artefacts} packet={packet} />
        </>) : inputs?.length ? (<>
          <h3>Other files</h3>
          <Inputs inputs={inputs} packet={packet} />
        </>) : (
          <p>There are no artefacts or files to download for this packet.</p>
        )}
      </>)}
    </>
  );
}
