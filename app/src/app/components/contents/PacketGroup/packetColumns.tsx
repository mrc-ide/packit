import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Packet } from "../../../../types";
import { CheckSquare, X } from "lucide-react";
import { Separator } from "../../Base/Separator";

export const packetColumns: ColumnDef<Packet>[] = [
  {
    accessorKey: "id",
    header: "Packet",
    cell: ({ getValue, row }) => {
      const id = getValue() as string;
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
  },
  {
    accessorKey: "published",
    header: "Published",
    cell: ({ getValue }) => (getValue() ? <CheckSquare size={20} className="ml-1" /> : <X size={20} className="ml-1" />)
  },
  {
    accessorKey: "parameters",
    header: "Parameters",
    cell: ({ getValue }) => {
      const parameters = getValue() as Record<string, string>;

      return (
        <div className="flex space-x-1">
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
  }
];
