import { createColumnHelper } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Packet } from "../../../../types";

const columnHelper = createColumnHelper<Packet>();

export const packetColumns = [
  columnHelper.accessor("id", {
    header: "Packet",
    cell: ({ getValue, row }) => {
      const id = getValue();
      const startTime = new Date(row.original.startTime * 1000); // convert from seconds to milliseconds
      const isPublished = row.original.published;

      return (
        <div className="flex flex-col">
          <Link
            to={`/${row.original.name}/${id}`}
            className="hover:underline decoration-blue-500 text-sm font-semibold text-blue-500"
          >
            {id}
          </Link>
          <div className="flex space-x-2 items-center">
            <div className="text-xs text-muted-foreground">{startTime.toLocaleString()}</div>
            {isPublished ? (
              <div className="text-xs text-green-500">Published</div>
            ) : (
              <div className="text-xs text-orange-500">Internal</div>
            )}
          </div>
        </div>
      );
    }
  }),
  columnHelper.accessor("parameters", {
    header: "Parameters",
    cell: ({ getValue }) => {
      const parameters = getValue();

      return (
        <div className="flex flex-wrap gap-1">
          {Object.keys(parameters)?.length === 0 ? (
            <div className="italic text-xs">None</div>
          ) : (
            Object.entries(parameters).map(([key, val]) => (
              <div key={key} className="border py-1 px-1.5 rounded-md flex space-x-1 text-xs">
                <div>{key}: </div>
                <div className="text-muted-foreground"> {val.toString()}</div>
              </div>
            ))
          )}
        </div>
      );
    }
  })
];
