import { Link } from "react-router-dom";
import { getTimeDifferenceToDisplay } from "../../../../lib/time";
import { PinIcon } from "lucide-react";
import { ZipDownloadButton } from "../downloads/ZipDownloadButton";
import { allArtefactsFilesForPacket } from "../downloads/utils/artefactFiles";
import { PacketMetadata } from "../../../../types";

interface PinProps {
  packet: PacketMetadata;
}

export const Pin = ({ packet }: PinProps) => {
  const { unit, value } = getTimeDifferenceToDisplay(packet.time.start)[0];
  const allArtefactsFiles = allArtefactsFilesForPacket(packet);

  return (
    <li className="p-3.5 flex flex-col border rounded shadow">
      <div className="flex gap-5 justify-between">
        <Link to={`/${packet.name}/${packet.id}`} className="hover:underline decoration-blue-500 min-w-[50%] w-fit">
          <h3 className="scroll-m-20 text-lg font-semibold tracking-tight text-blue-500">
            {packet.displayName || packet.name}
          </h3>
        </Link>
        <PinIcon size={18} className="opacity-50"></PinIcon>
      </div>
      <div className="flex gap-x-3 items-center mt-2 text-xs">
        {allArtefactsFiles && (
          <ZipDownloadButton
            packetId={packet.id}
            files={allArtefactsFiles}
            zipName={`${packet.name}_artefacts_${packet.id}.zip`}
            variant="link"
            buttonText={allArtefactsFiles.length == 0 ? "No artefacts" : "Download artefacts"}
            className="text-blue-500 p-0 text-xs"
            containerClassName="!gap-0 !items-start"
            disabled={allArtefactsFiles.length == 0}
          />
        )}
        <div className="text-muted-foreground whitespace-nowrap">
          Ran {value} {unit} ago
        </div>
      </div>
    </li>
  );
};
