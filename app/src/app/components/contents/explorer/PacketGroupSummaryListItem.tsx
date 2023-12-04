import { ExternalLink, History, Hourglass } from "lucide-react";
import { Link } from "react-router-dom";
import { PacketGroupSummary } from "../../../../types";
import { getTimeDifferenceToDisplay } from "./utils/getTimeDifferenceToDisplay";

interface PacketGroupSummaryListItemProps {
  packet: PacketGroupSummary;
}

export const PacketGroupSummaryListItem = ({ packet }: PacketGroupSummaryListItemProps) => {
  const { unit, value } = getTimeDifferenceToDisplay(packet.latestTime);

  return (
    <li key={packet.latestId} className="p-4 flex flex-col border-b space-y-1">
      <Link to={`/${packet.name}`} className="hover:underline decoration-blue-500">
        <h3 className="scroll-m-20 text-lg font-semibold tracking-tight text-blue-500">{packet.name}</h3>
      </Link>
      <div className="flex space-x-3 items-center">
        <Link
          to={`/${packet.name}/${packet.latestId}`}
          className="text-muted-foreground text-xs flex items-center gap-[1px] 
hover:text-blue-500"
        >
          <ExternalLink size={16} />
          Latest
        </Link>
        <div className="text-muted-foreground text-xs flex items-center gap-[1px]">
          <History size={16} />
          {packet.nameCount} Versions
        </div>
        <div className="text-muted-foreground text-xs flex items-center gap-[1px]">
          <Hourglass size={16} />
          Updated {value} {unit} ago
        </div>
      </div>
    </li>
  );
};
