import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@components/Base/Button";

interface PaginationProps {
  currentPageNumber: number;
  totalPages: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  setPageNumber: (pageNumber: number) => void;
}

export const Pagination = ({
  totalPages,
  currentPageNumber,
  isFirstPage,
  isLastPage,
  setPageNumber
}: PaginationProps) => {
  return (
    <div className="flex items-center space-x-6">
      <div className="flex w-[100px] items-center justify-center text-sm">
        Page {currentPageNumber + 1} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 md:flex"
          onClick={() => setPageNumber(0)}
          disabled={isFirstPage}
          aria-label="back-to-first-page"
        >
          <ChevronsLeft size={16} />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => setPageNumber(currentPageNumber - 1)}
          disabled={isFirstPage}
          aria-label="back-to-previous-page"
        >
          <ChevronLeft size={16} />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => setPageNumber(currentPageNumber + 1)}
          disabled={isLastPage}
          aria-label="go-to-next-page"
        >
          <ChevronRight size={16} />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 md:flex"
          onClick={() => setPageNumber(totalPages - 1)}
          disabled={isLastPage}
          aria-label="go-to-last-page"
        >
          <ChevronsRight size={16} />
        </Button>
      </div>
    </div>
  );
};
