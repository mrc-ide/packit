import { useState } from "react";
import { PAGE_SIZE } from "../../../../lib/constants";
import { Packet } from "../../../../types";
import { DataTable } from "../common/DataTable";
import { setupPacketColumns } from "./packetColumns";
import { Button } from "../../Base/Button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../../Base/DropdownMenu";
import { Settings2 } from "lucide-react";

interface PacketDataTableProps {
  packets: Packet[];
}
export const PacketDataTable = ({ packets }: PacketDataTableProps) => {
  const allParametersKeys = new Set(packets.flatMap((packet) => Object.keys(packet.parameters)));
  const initializeColumnVisibility = (keys: Set<string>) => {
    const visibility: Record<string, boolean> = {};
    keys.forEach((key) => {
      visibility[`parameters_${key}`] = false; // hide all parameters by default
    });
    return visibility;
  };

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    initializeColumnVisibility(allParametersKeys)
  );
  return (
    <div className="space-y-4 flex flex-col">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={allParametersKeys.size === 0}>
            <Button variant="outline" size="sm" className="ml-auto flex gap-1">
              <Settings2 className="h-5 w-5" />
              Parameter Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Array.from(allParametersKeys, (param, idx) => {
              return (
                <DropdownMenuCheckboxItem
                  key={`param-${idx}`}
                  checked={columnVisibility[`parameters_${param}`]}
                  onCheckedChange={(value) =>
                    setColumnVisibility((previousVisibility) => ({
                      ...previousVisibility,
                      [`parameters_${param}`]: value
                    }))
                  }
                >
                  {param}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
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
