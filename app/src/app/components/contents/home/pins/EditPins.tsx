import { useGetPacketGroupSummaries } from "../hooks/useGetPacketGroupSummaries";
import { EditablePin } from "./EditablePin";
import { Button } from "../../../Base/Button";
import { Plus } from "lucide-react";

export const EditPins = () => {
  const { packetGroupSummaries } = useGetPacketGroupSummaries(0, 100, "");

  return (
    <div className="flex justify-center">
      <div className="h-full flex flex-1 flex-col space-y-6 p-8 max-w-5xl">
        {/* Choose a pin to edit, or delete a pin, or add a new pin */}
        <h2 className="text-lg font-bold tracking-tight">Edit pins</h2>
        <Button className="mb-4 h-fit">
          <Plus size={18} />
          <span className="ps-2">Add a pin</span>
        </Button>
        <div className="flex gap-3 flex-wrap me-[-1rem]">
          {packetGroupSummaries?.content[0] && <EditablePin packetGroup={packetGroupSummaries?.content[0]} />}
          {packetGroupSummaries?.content[1] && <EditablePin packetGroup={packetGroupSummaries?.content[1]} />}
          {packetGroupSummaries?.content[2] && <EditablePin packetGroup={packetGroupSummaries?.content[2]} />}
        </div>
      </div>
    </div>
  );
};
