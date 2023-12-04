import debounce from "lodash.debounce";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../../Base/Button";
import { Input } from "../../Base/Input";
import { PacketGroupSummaryList } from "./PacketGroupSummaryList";

export const Home = () => {
  const [filterByName, setFilterByName] = useState("");
  const [pageNumber, setPageNumber] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const PAGE_SIZE = 50;

  const handleSetNameFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterByName(event.target.value);
    setPageNumber(0);
  };
  const handleResetFilter = () => {
    if (inputRef?.current) {
      inputRef.current.value = "";
    }
    setFilterByName("");
    setPageNumber(0);
  };
  const debouncedSetFilterByName = useCallback(debounce(handleSetNameFilter, 300), []);

  useEffect(() => {
    return () => {
      debouncedSetFilterByName.cancel();
    };
  }, []);

  return (
    <div className="flex justify-center">
      <div className="h-full flex flex-1 flex-col space-y-8 p-8 max-w-5xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">A place to view and manage packets</h2>
          <p className="text-muted-foreground">Here&apos;s a list of packet groups</p>
        </div>
        <div className="space-y-4 flex flex-col">
          <div className="flex space-x-4">
            <Input
              placeholder="Find a Report by name..."
              onChange={debouncedSetFilterByName}
              className="h-8 sm:w-[450px] lg:w-[600px]"
              ref={inputRef}
            />
            {filterByName && (
              <Button variant="ghost" onClick={handleResetFilter} className="h-8 px-2 lg:px-3">
                Reset
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
          <PacketGroupSummaryList
            filterByName={filterByName}
            pageNumber={pageNumber}
            pageSize={PAGE_SIZE}
            setPageNumber={setPageNumber}
          />
        </div>
      </div>
    </div>
  );
};
