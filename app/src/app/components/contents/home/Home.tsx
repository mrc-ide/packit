import { useState } from "react";
import { FilterInput } from "../common/FilterInput";
import { PacketGroupSummaryList } from "./PacketGroupSummaryList";
import { PAGE_SIZE } from "../../../../lib/constants";
import { useGetPacketGroupSummaries } from "./hooks/useGetPacketGroupSummaries";
import { Pin } from "./Pin";
import { Separator } from "../../Base/Separator";

export const Home = () => {
  const [filteredName, setFilterByName] = useState("");
  const [pageNumber, setPageNumber] = useState(0);

  const { packetGroupSummaries } = useGetPacketGroupSummaries(pageNumber, 100, "");

  return (
    <div className="flex justify-center">
      <div className="h-full flex flex-1 flex-col space-y-6 p-8 max-w-5xl">
        <h2 className="text-xl font-bold tracking-tight">Reports</h2>
        <div className="flex gap-3 flex-wrap me-[-1rem]">
          {packetGroupSummaries?.content[0] && <Pin packetGroup={packetGroupSummaries?.content[0]} />}
          {packetGroupSummaries?.content[1] && <Pin packetGroup={packetGroupSummaries?.content[1]} />}
          {packetGroupSummaries?.content[2] && <Pin packetGroup={packetGroupSummaries?.content[2]} />}
          {packetGroupSummaries?.content[3] && <Pin packetGroup={packetGroupSummaries?.content[3]} />}
          {packetGroupSummaries?.content[4] && <Pin packetGroup={packetGroupSummaries?.content[4]} />}
          {packetGroupSummaries?.content[5] && <Pin packetGroup={packetGroupSummaries?.content[5]} />}
          {packetGroupSummaries?.content[6] && <Pin packetGroup={packetGroupSummaries?.content[6]} />}
          {packetGroupSummaries?.content[7] && <Pin packetGroup={packetGroupSummaries?.content[7]} />}
          {packetGroupSummaries?.content[8] && <Pin packetGroup={packetGroupSummaries?.content[8]} />}
        </div>
        <Separator />
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
