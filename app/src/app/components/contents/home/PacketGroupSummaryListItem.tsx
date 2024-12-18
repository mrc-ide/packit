import { ExternalLink, Hourglass, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { PacketGroupDisplay } from "../../../../types";
import { getTimeDifferenceToDisplay } from "../../../../lib/time";

interface PacketGroupSummaryListItemProps {
  packetGroup: PacketGroupDisplay;
}

export const PacketGroupSummaryListItem = ({ packetGroup }: PacketGroupSummaryListItemProps) => {
  const { unit, value } = getTimeDifferenceToDisplay(packetGroup.latestStartTime)[0];

  return (
    <li key={packetGroup.latestPacketId} className="p-4 flex flex-col border-b">
      <Link to={`/${packetGroup.name}`} className="hover:underline decoration-blue-500 min-w-[50%] w-fit">
        <h3 className="scroll-m-20 text-lg font-semibold tracking-tight text-blue-500">
          {packetGroup.latestDisplayName}
        </h3>
      </Link>
      {packetGroup.name !== packetGroup.latestDisplayName && (
        <div className="text-muted-foreground text-sm items-center">
          {packetGroup.name}
        </div>
      )}
      <div className="flex flex-wrap gap-y-2 space-x-3 items-center mt-1">
        <Link
          to={`/${packetGroup.name}/${packetGroup.latestPacketId}`}
          className=" text-blue-500 text-xs flex items-center gap-[1px]
          hover:underline decoration-blue-500"
        >
          <ExternalLink size={16} />
          <span className="ps-0.5">Latest</span>
        </Link>
        <div className="text-muted-foreground text-xs flex items-center gap-[1px]">
          <Layers size={16} className="opacity-50" />
          <span className="ps-0.5">
            {packetGroup.packetCount} {packetGroup.packetCount === 1 ? "packet" : "packets"}
          </span>
        </div>
        <div className="text-muted-foreground text-xs flex items-center gap-[1px]">
          <Hourglass size={16} className="opacity-50" />
          <span className="ps-0.5">
            Updated {value} {unit} ago
          </span>
        </div>
      </div>
    </li>
  )
    ;
};