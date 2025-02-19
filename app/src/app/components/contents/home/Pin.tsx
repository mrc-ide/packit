import { Link } from "react-router-dom";
import { PacketGroupSummary } from "../../../../types";
import { getTimeDifferenceToDisplay } from "../../../../lib/time";
import { PinIcon } from "lucide-react";
import { ZipDownloadButton } from "../downloads/ZipDownloadButton";
import { useGetPacketById } from "../common/hooks/useGetPacketById";

interface PinProps {
  packetGroup: PacketGroupSummary;
}

export const Pin = ({ packetGroup }: PinProps) => {
  const { unit, value } = getTimeDifferenceToDisplay(packetGroup.latestTime)[0];

  const { packet } = useGetPacketById(packetGroup.latestId);

  // min-w-[32%]
  return (
    <li key={packetGroup.latestId} className="p-4 flex flex-col border rounded shadow">
      <div className="flex gap-5">
        <Link to={`/${packetGroup.name}`} className="hover:underline decoration-blue-500 min-w-[50%] w-fit">
          <h3 className="scroll-m-20 text-lg font-semibold tracking-tight text-blue-500">
            {packetGroup.latestDisplayName}
          </h3>
        </Link>
        <PinIcon size={16} className="opacity-50 ms-auto"></PinIcon>
      </div>
      <div className="flex flex-wrap gap-y-2 space-x-3 items-center mt-2 text-xs">
        {packet && packet.files && (
          <ZipDownloadButton
            packetId={packet.id}
            files={packet.files}
            zipName={"zip.zip"}
            variant="link"
            className="text-blue-500 p-0 text-xs"
            containerClassName="!gap-0"
          />
        )}
        <div className="text-muted-foreground flex items-center gap-[1px]">
          <span className="ps-0.5">
            Updated {value} {unit} ago
          </span>
        </div>
      </div>
    </li>
  );
};
