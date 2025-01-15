import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../Base/Accordion";
import { InputFileType } from "../../../../../types";
import Artefacts from "./Artefacts";
import OtherFiles from "./OtherFiles";
import { usePacketOutletContext } from "../../../main/PacketOutlet";

export const OrderlyDownloads = () => {
  const { packet } = usePacketOutletContext();
  const artefacts = packet?.custom?.orderly.artefacts;
  const inputFiles = packet?.custom?.orderly.role.filter((input) =>
    [InputFileType.Resource, InputFileType.Shared].includes(input.role)
  );

  if (!!artefacts?.length && !!inputFiles?.length) {
    return (
      <Accordion type="multiple" defaultValue={["artefacts"]} data-testid="accordion">
        <AccordionItem value="artefacts">
          <AccordionTrigger>
            <h3>Artefacts</h3>
          </AccordionTrigger>
          <AccordionContent>
            <Artefacts artefacts={artefacts} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="inputs">
          <AccordionTrigger>
            <h3>Other files</h3>
          </AccordionTrigger>
          <AccordionContent>
            <OtherFiles inputFiles={inputFiles} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  } else if (artefacts?.length) {
    return (
      <>
        <h3>Artefacts</h3>
        <Artefacts artefacts={artefacts} />
      </>
    );
  } else if (inputFiles?.length) {
    return (
      <>
        <h3>Files</h3>
        <OtherFiles inputFiles={inputFiles} />
      </>
    );
  } else {
    return <p>There are no artefacts or files to download for this packet.</p>;
  }
};
