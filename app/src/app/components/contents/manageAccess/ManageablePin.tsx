import { Link } from "react-router-dom";
import { getTimeDifferenceToDisplay } from "../../../../lib/time";
import { PinOffIcon } from "lucide-react";
import { PacketMetadata } from "../../../../types";
import { KeyedMutator } from "swr";

interface ManagebalePinProps {
  packet: PacketMetadata;
  mutate: KeyedMutator<PacketMetadata[]>;
}

export const ManageablePin = ({ packet }: ManagebalePinProps) => {
  const { unit, value } = getTimeDifferenceToDisplay(packet.time.start)[0];

  return (
    <li className="p-3.5 flex gap-3 items-center border rounded shadow">
      {/* todo: use mutate here */}
      <PinOffIcon size={20} className="cursor-pointer stroke-destructive opacity-75 hover:opacity-100" />
      <div>
        <div className="flex gap-2 items-center">
          <Link to={`/${packet.name}/${packet.id}`} className="hover:underline decoration-blue-500 min-w-[50%] w-fit">
            <h3 className="scroll-m-20 text-lg font-semibold tracking-tight text-blue-500">
              {packet.displayName || packet.name}
            </h3>
          </Link>
          <p>{(!packet.displayName || packet.displayName === packet.name) ? '' : `(${packet.name})`}</p>
        </div>
        <p className="text-muted-foreground text-sm">
          {packet.id}
        </p>
        <div className="flex gap-x-3 items-center mt-2 text-xs">
          <div className="text-muted-foreground whitespace-nowrap">
            Ran {value} {unit} ago
          </div>
        </div>
      </div>
    </li>
  );
};
