import { useState } from "react";
import { FilterInput } from "../common/FilterInput";
import { PacketGroupSummaryList } from "./PacketGroupSummaryList";
import { PAGE_SIZE } from "../../../../lib/constants";
import { Pin } from "./Pin";
import { Separator } from "../../Base/Separator";
import { useGetPinnedPackets } from "./hooks/useGetPinnedPackets";
import { ErrorComponent } from "../common/ErrorComponent";

export const Home = () => {
  const [filteredName, setFilterByName] = useState("");
  const [pageNumber, setPageNumber] = useState(0);

  const { packets: pinnedPackets, error, isLoading } = useGetPinnedPackets();
  // const pinnedReports = ["20240729-154633-10abe7d1", "20241122-111130-544ddd35", "20240729-154657-76529696"];

  if (error) return <ErrorComponent message="Error fetching pinned reports" error={error} />;

  return (
    <div className="flex justify-center">
      <div className="h-full flex flex-1 flex-col space-y-6 p-8 max-w-5xl">
        {pinnedPackets && pinnedPackets.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold tracking-tight mb-6">Pinned reports</h2>
            <div className="overflow-x-auto pb-3">
              <div className="flex gap-3">
                {pinnedPackets?.map((packet) => <Pin key={packet.id} packet={packet} />)}
              </div>
            </div>
            <Separator />
          </div>
        )}
        <h2 className="text-lg font-bold tracking-tight">Find a report</h2>
        <div className="space-y-4 flex flex-col">
          <FilterInput
            setFilter={setFilterByName}
            postFilterAction={() => setPageNumber(0)}
            placeholder="Filter packet groups"
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
