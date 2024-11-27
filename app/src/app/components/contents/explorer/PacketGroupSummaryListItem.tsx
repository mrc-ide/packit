import {ExternalLink, Hourglass, Layers} from "lucide-react";
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
      <Link to={`/${packetGroup.name}`} className="hover:underline decoration-blue-500 min-w-[50%] w-fit">
        <h3 className="scroll-m-20 text-lg font-semibold tracking-tight text-blue-500">
          {packetGroup.latestDisplayName}
        </h3>
      </Link>
      <div className="flex flex-wrap gap-y-2 space-x-3 items-center">
        <Link
          to={`/${packetGroup.name}/${packetGroup.latestId}`}
          className=" text-blue-500 text-xs flex items-center gap-[1px] 
          hover:underline decoration-blue-500"
        >
          <ExternalLink size={16} />
          <span className="ps-0.5">Latest</span>
        </Link>
        <div className="text-muted-foreground text-xs flex items-center gap-[1px]">
          <Layers size={16} className="opacity-50"/>
          <span className="ps-0.5">
            {packetGroup.packetCount} {packetGroup.packetCount === 1 ? "packet" : "packets"}
          </span>
        </div>
        <div className="text-muted-foreground text-xs flex items-center gap-[1px]">
          <Hourglass size={16} className="opacity-50"/>
          Updated {value} {unit} ago
        </div>
        {packetGroup.name !== packetGroup.latestDisplayName && (
          <div className="text-muted-foreground text-xs flex items-center">
            <span className="opacity-50 font-bold tracking-wider text-2xs
             ps-[0.2rem] pe-[0.15rem] border-current border rounded">ID</span>
            <span className="ps-1">{packetGroup.name}</span>
          </div>
        )}
    </div>
</li>
)
  ;
};
