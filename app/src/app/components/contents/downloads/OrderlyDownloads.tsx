import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../Base/Accordion";
import { PacketMetadata, Roles } from "../../../../types";
import Artefacts from "./Artefacts";
import OtherFiles from "./OtherFiles";

interface OrderlyDownloadsProps {
  packet: PacketMetadata;
}

export const OrderlyDownloads = ({ packet }: OrderlyDownloadsProps) => {
  const artefacts = packet?.custom?.orderly.artefacts;
  const inputs = packet?.custom?.orderly.role.filter((input) => [Roles.Resource, Roles.Shared].includes(input.role));

  if (!!artefacts?.length && !!inputs?.length) {
    return (
      <Accordion type="multiple" defaultValue={["artefacts"]} data-testid="accordion">
        <AccordionItem value="artefacts">
          <AccordionTrigger>
            <h3>Artefacts</h3>
          </AccordionTrigger>
          <AccordionContent>
            <Artefacts artefacts={artefacts} packet={packet} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="inputs">
          <AccordionTrigger>
            <h3>Other files</h3>
          </AccordionTrigger>
          <AccordionContent>
            <OtherFiles inputs={inputs} packet={packet} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  } else if (artefacts?.length) {
    return (
      <>
        <h3>Artefacts</h3>
        <Artefacts artefacts={artefacts} packet={packet} />
      </>
    );
  } else if (inputs?.length) {
    return (
      <>
        <h3>Files</h3>
        <OtherFiles inputs={inputs} packet={packet} />
      </>
    );
  } else {
    return <p>There are no artefacts or files to download for this packet.</p>;
  }
};
