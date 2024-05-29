import debounce from "lodash.debounce";
import { Dispatch, SetStateAction, useCallback, useEffect, useRef } from "react";
import { Input } from "../../Base/Input";
import { Button } from "../../Base/Button";
import { X } from "lucide-react";

interface FilterByNameProps {
  setFilter: Dispatch<SetStateAction<string>>;
  postFilterAction?: () => void;
  placeholder: string;
}
export const FilterInput = ({ setFilter, postFilterAction, placeholder }: FilterByNameProps) => {
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
    <div className="flex space-x-4">
      <Input
        placeholder={placeholder}
        onChange={debouncedSetFilterByName}
        className="h-8 sm:w-[450px] lg:w-[600px]"
        ref={inputRef}
      />
      {inputRef.current?.value && (
        <Button variant="ghost" onClick={handleResetFilter} className="h-8 px-2 lg:px-3">
          Reset
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
