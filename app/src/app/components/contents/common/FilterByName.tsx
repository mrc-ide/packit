import debounce from "lodash.debounce";
import { Dispatch, SetStateAction, useCallback, useEffect, useRef } from "react";
import { Input } from "../../Base/Input";
import { Button } from "../../Base/Button";
import { X } from "lucide-react";

interface FilterByNameProps {
  filteredName: string;
  setFilterByName: Dispatch<SetStateAction<string>>;
  setPageNumber?: Dispatch<SetStateAction<number>>;
}
export const FilterByName = ({ filteredName, setFilterByName, setPageNumber }: FilterByNameProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSetNameFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterByName(event.target.value);
    if (setPageNumber) {
      setPageNumber(0);
    }
  };
  const handleResetFilter = () => {
    if (inputRef?.current) {
      inputRef.current.value = "";
    }
    setFilterByName("");
    if (setPageNumber) {
      setPageNumber(0);
    }
  };
  const debouncedSetFilterByName = useCallback(debounce(handleSetNameFilter, 300), []);

  useEffect(() => {
    return () => {
      debouncedSetFilterByName.cancel();
    };
  }, []);

  return (
    <div className="flex space-x-4">
      <Input
        placeholder="Find Role by name..."
        onChange={debouncedSetFilterByName}
        className="h-8 sm:w-[450px] lg:w-[600px]"
        ref={inputRef}
      />
      {filteredName && (
        <Button variant="ghost" onClick={handleResetFilter} className="h-8 px-2 lg:px-3">
          Reset
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
