import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@components/Base/Accordion";
import { FileMetadata, InputFileType } from "@/types";
import { Artefacts } from "./Artefacts";
import { OtherFiles } from "./OtherFiles";
import { usePacketOutletContext } from "@components/main/PacketLayout";
import { ZipDownloadButton } from "../ZipDownloadButton";
import { useParams } from "react-router-dom";
import { getFileByPath } from "../utils/getFileByPath";

export const OrderlyDownloads = () => {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();
  const artefacts = packet?.custom?.orderly.artefacts;
  const inputs = packet?.custom?.orderly.role.filter((input) => {
    return input.role !== InputFileType.Dependency;
  });
  if (!packet) return null;
  const inputsFiles = inputs
    ?.map((input) => {
      return getFileByPath(input.path, packet);
    })
    .filter((f) => !!f) as FileMetadata[];

  if (!!artefacts?.length && !!inputs?.length && inputsFiles) {
    return (
      <div className="relative">
        <Accordion type="multiple" defaultValue={["artefacts"]} data-testid="accordion">
          <AccordionItem value="artefacts">
            <AccordionTrigger>
              <h3>Artefacts</h3>
            </AccordionTrigger>
            <AccordionContent>
              <Artefacts artefacts={artefacts} />
            </AccordionContent>
          </AccordionItem>
          <div className="relative">
            <AccordionItem value="inputs">
              <AccordionTrigger>
                <h3>Other files</h3>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2">
                  <span className="self-end absolute top-3 right-8">
                    <div className="flex flex-col items-end gap-1">
                      <ZipDownloadButton
                        packetId={packet.id}
                        files={inputsFiles}
                        zipName={`${packetName}_other_resources_${packetId}.zip`}
                        variant="ghost"
                      />
                    </div>
                  </span>
                  <OtherFiles inputs={inputs} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </div>
        </Accordion>
      </div>
    );
  } else if (artefacts?.length) {
    return (
      <>
        <h3>Artefacts</h3>
        <Artefacts artefacts={artefacts} />
      </>
    );
  } else if (inputs?.length) {
    return (
      <>
        <h3>Files</h3>
        <OtherFiles inputs={inputs} />
      </>
    );
  } else {
    return <p>There are no artefacts or files to download for this packet.</p>;
  }
};
