import { useState } from "react";
import { Search } from "lucide-react";
import { FilterInput } from "../common/FilterInput";
import { PacketGroupSummaryList } from "./PacketGroupSummaryList";
import { PAGE_SIZE } from "@lib/constants";
import { Pins } from "./Pins";

export const Home = () => {
  const [filteredName, setFilterByName] = useState("");
  const [pageNumber, setPageNumber] = useState(0);

  return (
    <div className="flex justify-center">
      <div className="h-full flex flex-1 flex-col space-y-6 p-8 max-w-5xl">
        <Pins />
        <h2 className="text-2xl font-bold tracking-tight">Find a packet group</h2>
        <div className="space-y-4 flex flex-col" data-testid="packet-group-index">
          <div className="flex space-x-2 items-center">
            <Search className="opacity-50" />
            <FilterInput
              setFilter={setFilterByName}
              postFilterAction={() => setPageNumber(0)}
              placeholder="Filter packet groups"
            />
          </div>
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
