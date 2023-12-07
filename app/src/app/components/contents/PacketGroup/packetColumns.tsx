import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Packet } from "../../../../types";
import { CheckSquare, X } from "lucide-react";
import { Separator } from "../../Base/Separator";

const columnHelper = createColumnHelper<Packet>();

export const packetColumns = [
  columnHelper.accessor("id", {
    header: "Packet",
    cell: ({ getValue, row }) => {
      const id = getValue();
      const time = new Date(row.original.time * 1000); // convert from seconds to milliseconds

      return (
        <div className="flex flex-col">
          <Link
            to={`/${row.original.name}/${id}`}
            className="hover:underline decoration-blue-500 text-sm font-semibold text-blue-500"
          >
            {id}
          </Link>
          <div className="text-xs text-muted-foreground">{time.toLocaleString()}</div>
        </div>
      );
    }
  }),
  columnHelper.accessor("published", {
    header: "Published",
    cell: ({ getValue }) => (getValue() ? <CheckSquare size={20} className="ml-1" /> : <X size={20} className="ml-1" />)
  }),
  columnHelper.accessor("parameters", {
    header: "Parameters",
    cell: ({ getValue }) => {
      const parameters = getValue();

      return (
        <div className="flex flex-wrap gap-0.5">
          {Object.keys(parameters)?.length === 0 ? (
            <div className="italic text-xs">None</div>
          ) : (
            Object.entries(parameters).map(([key, val]) => (
              <div key={key} className="border p-1 rounded-md flex space-x-1 text-xs">
                <div>{key}</div>
                <Separator orientation="vertical" />
                <div className="text-muted-foreground"> {val}</div>
              </div>
            ))
          )}
        </div>
      );
    }
  })
];
