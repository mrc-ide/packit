import { createColumnHelper, SortDirection } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Packet } from "../../../../types";
import { Button } from "../../Base/Button";
import { FilterInput } from "../common/FilterInput";
import { ParameterContainer } from "../common/ParameterContainer";

const SortIcon = ({ sortedDirection }: { sortedDirection: false | SortDirection }) => {
  if (!sortedDirection) return <ArrowUpDown className="ml-2 h-4 w-4" />;
  return sortedDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
};

const columnHelper = createColumnHelper<Packet>();
export const packetColumns = [
  columnHelper.accessor("id", {
    header: ({ column }) => {
      const sortedDirection = column.getIsSorted();

      return (
        <div className="flex flex-col items-start space-y-1 mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="sm:w-36 lg:w-48 justify-start"
            onClick={() => column.toggleSorting(sortedDirection === "asc")}
          >
            Packet
            <SortIcon sortedDirection={sortedDirection} />
          </Button>
          <FilterInput
            setFilter={column.setFilterValue}
            placeholder="Search..."
            inputClassNames="h-8 sm:w-36 lg:w-48"
            showResetButton={false}
          />
        </div>
      );
    },
    filterFn: "includesString",
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
    header: ({ column }) => {
      return (
        <div className="flex flex-col items-start space-y-2 mb-2 content-center">
          <div className="px-3 h-9 sm:w-36 lg:w-48 content-center">Parameters</div>
          <FilterInput
            setFilter={column.setFilterValue}
            placeholder="Search..."
            inputClassNames="h-8 sm:w-36 lg:w-48"
            showResetButton={false}
          />
        </div>
      );
    },
    filterFn: (row, _columnId, filterValue) =>
      Object.entries(row.original.parameters).some(
        ([key, value]) => key.includes(filterValue) || value.toLocaleString().includes(filterValue)
      ),
    cell: ({ getValue }) => {
      const parameters = getValue();
      return (
        <div className="flex flex-wrap gap-1">
          {Object.keys(parameters)?.length === 0 ? (
            <div className="italic text-xs">None</div>
          ) : (
            Object.entries(parameters).map(([key, val]) => (
              <ParameterContainer key={key} paramKey={key} paramValue={val} />
            ))
          )}
        </div>
      );
    }
  })
];
