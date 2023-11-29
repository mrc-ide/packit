import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { PageablePacketIdCountsDTO } from "../../../../types";
import { Button } from "../../Base/Button";

interface PacketListPaginationProps {
  pageNumber: number;
  data: PageablePacketIdCountsDTO;
  setPageNumber: Dispatch<SetStateAction<number>>;
}

export const PacketListPagination = ({ data, pageNumber, setPageNumber }: PacketListPaginationProps) => {
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center space-x-6">
        <div className="flex w-[100px] items-center justify-center text-sm">
          Page {pageNumber + 1} of {data.totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 md:flex"
            onClick={() => setPageNumber(0)}
            disabled={data.first}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setPageNumber(pageNumber - 1)}
            disabled={data.first}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setPageNumber(pageNumber + 1)}
            disabled={data.last}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 md:flex"
            onClick={() => setPageNumber(data.totalPages - 1)}
            disabled={data.last}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
