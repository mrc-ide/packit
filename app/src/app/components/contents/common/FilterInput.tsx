import debounce from "lodash.debounce";
import { Dispatch, SetStateAction, useCallback, useEffect, useRef } from "react";
import { Input } from "../../Base/Input";
import { Button } from "../../Base/Button";
import { Search, X } from "lucide-react";
import { cn } from "../../../../lib/cn";

interface FilterByNameProps {
  setFilter: Dispatch<SetStateAction<string>>;
  postFilterAction?: () => void;
  placeholder?: string;
  inputClassNames?: string;
}

export const FilterInput = ({
  setFilter,
  postFilterAction,
  placeholder = "Search...",
  inputClassNames
}: FilterByNameProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSetNameFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
    postFilterAction && postFilterAction();
  };
  const handleResetFilter = () => {
    if (inputRef?.current) {
      inputRef.current.value = "";
    }
    setFilter("");
    postFilterAction && postFilterAction();
  };
  const debouncedSetFilterByName = useCallback(debounce(handleSetNameFilter, 300), []);

  useEffect(() => {
    return () => {
      debouncedSetFilterByName.cancel();
    };
  }, []);

  return (
    <div className="flex space-x-2 items-center">
      <Search className="opacity-50" />
      <Input
        placeholder={placeholder}
        onChange={debouncedSetFilterByName}
        className={cn("h-8 sm:w-[450px] lg:w-[600px]", inputClassNames)}
        ref={inputRef}
      ></Input>
      {inputRef.current?.value && (
        <Button variant="ghost" onClick={handleResetFilter} className="h-6 w-6" size="icon" aria-label="reset filter">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
