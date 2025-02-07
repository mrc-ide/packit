import { useState } from "react";
import { PAGE_SIZE } from "../../../../lib/constants";
import { Packet } from "../../../../types";
import { DataTable } from "../common/DataTable";
import { setupPacketColumns } from "./packetColumns";
import { ToggleParamColumnsDropdownColumns } from "./ToggleParamColumnsDropdown";
import { initializeColumnVisibility } from "./utils/initializeColumnVisibility";

interface PacketDataTableProps {
  packets: Packet[];
}
export const PacketDataTable = ({ packets }: PacketDataTableProps) => {
  const allParametersKeys = new Set(packets.flatMap((packet) => Object.keys(packet.parameters)));
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    initializeColumnVisibility(allParametersKeys)
  );

  return (
    <div className="space-y-4 flex flex-col">
      <div className="flex justify-end">
        <ToggleParamColumnsDropdownColumns
          allParametersKeys={allParametersKeys}
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
        />
      </div>
      <DataTable
        columns={setupPacketColumns(allParametersKeys)}
        data={packets}
        pagination={{ pageSize: PAGE_SIZE }}
        visibility={{ columnVisibility, setColumnVisibility }}
        clientFiltering
      />
    </div>
  );
};
