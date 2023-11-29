import debounce from "lodash.debounce";
import { useCallback, useEffect, useState } from "react";
import { Input } from "../../Base/Input";
import { PacketList } from "./PacketList";

export const Home = () => {
  const [filterByName, setFilterByName] = useState(""); // TODO add debounce

  const debouncedSetFilterByName = useCallback(debounce(setFilterByName, 300), []);

  useEffect(() => {
    return () => {
      debouncedSetFilterByName.cancel();
    };
  }, []);

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome to Reports</h2>
        <p className="text-muted-foreground">Here&apos;s a list of all reports</p>
      </div>
      <div className="space-y-4 flex flex-col">
        <div>
          <Input
            placeholder="Find a Report by name..."
            onChange={(event) => debouncedSetFilterByName(event.target.value)}
            className="h-8 sm:w-[450px] lg:w-[600px]"
          />
        </div>
        <PacketList filterByName={filterByName} />
      </div>
    </div>
  );
};
