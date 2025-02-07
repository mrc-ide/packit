import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../Base/Table";
import { Pagination } from "./Pagination";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  pagination?: {
    pageSize: number;
  };
  visibility?: {
    columnVisibility: Record<string, boolean>;
    setColumnVisibility: Dispatch<SetStateAction<Record<string, boolean>>>;
  };
  clientFiltering?: boolean;
}

export const DataTable = <TData,>({
  data,
  columns,
  pagination,
  visibility,
  clientFiltering = false
}: DataTableProps<TData>) => {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(pagination && { getPaginationRowModel: getPaginationRowModel() }),
    ...(clientFiltering && { getFilteredRowModel: getFilteredRowModel() }),
    ...(visibility && { onColumnVisibilityChange: visibility.setColumnVisibility }),
    initialState: {
      ...(pagination && {
        pagination: {
          pageSize: pagination.pageSize
        }
      })
    },
    state: {
      ...(visibility && {
        columnVisibility: visibility.columnVisibility
      })
    },
    manualFiltering: clientFiltering ? false : true
  });
  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-2">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-background">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows?.length ? (
              rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && (
        <div className="flex items-center justify-center">
          <Pagination
            currentPageNumber={table.getState().pagination.pageIndex}
            totalPages={table.getPageCount()}
            isFirstPage={!table.getCanPreviousPage()}
            isLastPage={!table.getCanNextPage()}
            setPageNumber={table.setPageIndex}
          />
        </div>
      )}
    </div>
  );
};
