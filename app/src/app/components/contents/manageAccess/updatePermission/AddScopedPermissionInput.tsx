import debounce from "lodash.debounce";
import { ChevronsUpDown } from "lucide-react";
import React, { useCallback, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { PermissionScope } from "../../../../../lib/constants";
import { Button } from "../../../Base/Button";
import { Command, CommandInput } from "../../../Base/Command";
import { Popover, PopoverContent, PopoverTrigger } from "../../../Base/Popover";
import { PermissionCommandList } from "./PermissionCommandList";

interface AddScopedPermissionInputProps {
  scope: PermissionScope;
  form: UseFormReturn<any>;
}

export const AddScopedPermissionInput = ({ scope, form }: AddScopedPermissionInputProps) => {
  const [open, setOpen] = React.useState(false);
  const [filterName, setFilterName] = React.useState<string>("");

  const handleSetNameFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
  };
  const debouncedSetFilterByName = useCallback(debounce(handleSetNameFilter, 300), []);

  useEffect(() => {
    form.setValue("scopeResource", { id: "", name: "" });
    setFilterName("");
  }, [scope]);

  useEffect(() => {
    return () => {
      debouncedSetFilterByName.cancel();
    };
  }, []);

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[350px] justify-between"
            disabled={scope === "global"}
          >
            {form.getValues("scopeResource")?.id
              ? scope === "packet"
                ? form.getValues("scopeResource")?.id
                : form.getValues("scopeResource")?.name
              : "Select Resource..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={`Search ${scope}...`}
              onChangeCapture={(e) => debouncedSetFilterByName(e.nativeEvent as any)}
            />
            <PermissionCommandList
              filterName={filterName}
              setFilterName={setFilterName}
              scope={scope}
              setOpen={setOpen}
              scopeResource={form.getValues("scopeResource")}
              setScopeResource={(value) => form.setValue("scopeResource", value)}
            />
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
