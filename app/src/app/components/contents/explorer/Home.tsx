import { useState } from "react";
import { FilterInput } from "../common/FilterInput";
import { PacketGroupSummaryList } from "./PacketGroupSummaryList";
import { PAGE_SIZE } from "../../../../lib/constants";

export const Home = () => {
  const [filteredName, setFilterByName] = useState("");
  const [pageNumber, setPageNumber] = useState(0);

  return (
    <div className="flex justify-center">
      <div className="h-full flex flex-1 flex-col space-y-8 p-8 max-w-5xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">A place to view and manage packets</h2>
          <p className="text-muted-foreground">Here&apos;s a list of packet groups</p>
        </div>
        <div className="space-y-4 flex flex-col">
          <FilterInput
            setFilter={setFilterByName}
            postFilterAction={() => setPageNumber(0)}
            placeholder="filter packet groups..."
          />
          <PacketGroupSummaryList
            filterByName={filteredName}
            pageNumber={pageNumber}
            pageSize={PAGE_SIZE}
            setPageNumber={setPageNumber}
          />
        </div>
      </div>
    </div>
  );
};
