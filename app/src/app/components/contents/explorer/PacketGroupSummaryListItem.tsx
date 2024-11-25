import { ExternalLink, History, Hourglass } from "lucide-react";
import { Link } from "react-router-dom";
import { PacketGroupSummary } from "../../../../types";
import { getTimeDifferenceToDisplay } from "../../../../lib/time";

interface PacketGroupSummaryListItemProps {
  packetGroup: PacketGroupSummary;
}

export const PacketGroupSummaryListItem = ({ packetGroup }: PacketGroupSummaryListItemProps) => {
  const { unit, value } = getTimeDifferenceToDisplay(packetGroup.latestTime)[0];

  return (
    <li key={packetGroup.latestId} className="p-4 flex flex-col border-b space-y-1">
      <Link to={`/${packetGroup.name}`} className="hover:underline decoration-blue-500">
        <h3 className="scroll-m-20 text-lg font-semibold tracking-tight text-blue-500">
          {packetGroup.latestDisplayName}
        </h3>
      </Link>
      <div className="flex space-x-3 items-center">
        <Link
          to={`/${packetGroup.name}/${packetGroup.latestId}`}
          className=" text-blue-500 text-xs flex items-center gap-[1px] 
          hover:underline decoration-blue-500"
        >
          <ExternalLink size={16} />
          Latest
        </Link>
        <div className="text-muted-foreground text-xs flex items-center gap-[1px]">
          <History size={16} />
          {packetGroup.packetCount} Packets
        </div>
        <div className="text-muted-foreground text-xs flex items-center gap-[1px]">
          <Hourglass size={16} />
          Updated {value} {unit} ago
        </div>
      </div>
    </li>
  );
};
