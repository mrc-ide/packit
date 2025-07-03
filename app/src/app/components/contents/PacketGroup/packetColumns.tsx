import { createColumnHelper, SortDirection } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Packet } from "@/types";
import { Button } from "@components/Base/Button";
import { FilterInput } from "../common/FilterInput";
import { ParameterContainer } from "../common/ParameterContainer";

const SortIcon = ({ sortedDirection }: { sortedDirection: false | SortDirection }) => {
  const iconClassName = "ml-2 h-4 w-4";

  if (!sortedDirection) return <ArrowUpDown className={iconClassName} />;
  return sortedDirection === "asc" ? <ArrowUp className={iconClassName} /> : <ArrowDown className={iconClassName} />;
};

const columnHelper = createColumnHelper<Packet>();
export const setupPacketColumns = (allParametersKeys: Set<string>) => {
  const defaultColumns = [
    columnHelper.accessor("id", {
      header: ({ column }) => {
        const sortedDirection = column.getIsSorted();

        return (
          <div className="flex flex-col items-start space-y-1 mb-1 mt-0.5">
            <Button
              variant="link"
              size="sm"
              className="w-fit justify-start h-fit py-1.5"
              onClick={() => column.toggleSorting(sortedDirection === "asc")}
            >
              Packet
              <SortIcon sortedDirection={sortedDirection} />
            </Button>
            <FilterInput
              setFilter={column.setFilterValue}
              placeholder="Search..."
              inputClassNames="h-8 sm:w-32 lg:w-40"
            />
          </div>
        );
      },
      filterFn: "includesString",
      cell: ({ getValue, row }) => {
        const id = getValue();
        const startTime = new Date(row.original.startTime * 1000); // convert from seconds to milliseconds

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
            </div>
          </div>
        );
      }
    }),
    columnHelper.accessor("parameters", {
      header: ({ column }) => {
        return (
          <div className="flex flex-col items-start space-y-1 mb-1 mt-0.5 content-center">
            <div className="px-3 h-fit py-1.5 sm:w-32 lg:w-40 content-center">Parameters</div>
            <FilterInput
              setFilter={column.setFilterValue}
              placeholder="Search..."
              inputClassNames="h-8 sm:w-32 lg:w-40"
            />
          </div>
        );
      },
      filterFn: (row, _columnId, filterValue) =>
        Object.entries(row.original.parameters).some(
          ([key, value]) => key.includes(filterValue) || value.toLocaleString().includes(filterValue)
        ),
      cell: ({ getValue, table }) => {
        const parameters = getValue();
        const visibleParamColumns = table
          .getVisibleLeafColumns()
          .filter(({ id }) => id.startsWith("parameters_"))
          .map(({ id }) => id.split("_")[1]);

        return (
          <div className="flex flex-wrap gap-1">
            {Object.keys(parameters)?.length === 0 ? (
              <div className="italic text-xs">None</div>
            ) : (
              Object.entries(parameters)
                .filter(([key]) => !visibleParamColumns.includes(key))
                .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                .map(([key, val]) => <ParameterContainer key={key} paramKey={key} paramValue={val} />)
            )}
          </div>
        );
      }
    })
  ];

  const parameterColumns = Array.from(allParametersKeys, (key) =>
    columnHelper.accessor(`parameters.${key}`, {
      id: `parameters_${key}`,
      header: ({ column }) => {
        const sortedDirection = column.getIsSorted();

        return (
          <div className="flex flex-col items-start space-y-1 mb-1 mt-0.5">
            <Button
              variant="link"
              size="sm"
              className="w-fit justify-start h-fit py-1.5"
              onClick={() => column.toggleSorting(sortedDirection === "asc")}
            >
              {key}
              <SortIcon sortedDirection={sortedDirection} />
            </Button>
            <FilterInput
              setFilter={column.setFilterValue}
              placeholder="Search..."
              inputClassNames="h-8 sm:w-24 lg:w-32"
            />
          </div>
        );
      },
      cell: ({ getValue }) => <div>{getValue()?.toLocaleString() ?? <span className="italic text-xs">n/a</span>}</div>,
      filterFn: "includesString"
    })
  );

  return [...defaultColumns, ...parameterColumns];
};
