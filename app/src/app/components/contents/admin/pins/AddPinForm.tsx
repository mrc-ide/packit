import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import debounce from "lodash.debounce";
import { KeyedMutator } from "swr";
import { z } from "zod";
import appConfig from "@config/appConfig";
import { ApiError } from "@lib/errors";
import { fetcher } from "@lib/fetch";
import { HttpStatus } from "@lib/types/HttpStatus";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/Base/Form";
import { CustomDialogFooter } from "@components/contents/common/CustomDialogFooter";
import { PacketMetadata } from "@/types";
import { Button } from "@components/Base/Button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@components/Base/Command";
import { Popover, PopoverContent, PopoverTrigger } from "@components/Base/Popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { useGetResourcesForScopedPermissions } from "../updatePermission/hooks/useGetResourcesForScopedPermissions";
import { CommandLoading } from "cmdk";
import { cn } from "@lib/cn";

interface AddPinFormProps {
  setFormOpen: Dispatch<SetStateAction<boolean>>;
  formOpen: boolean;
  mutate: KeyedMutator<PacketMetadata[]>;
}
export const AddPinForm = ({ setFormOpen, formOpen, mutate }: AddPinFormProps) => {
  const [fetchError, setFetchError] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [filter, setFilter] = useState<string>("");

  const formSchema = z.object({
    packetId: z.string()
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      packetId: ""
    }
  });

  const handleSetFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(`:${event.target.value}`);
  };
  const debouncedSetFilter = useCallback(debounce(handleSetFilter, 300), []);

  useEffect(() => {
    form.reset();
    setFilter("");
  }, [formOpen]);

  useEffect(() => {
    return () => {
      debouncedSetFilter.cancel();
    };
  }, []);

  const { data, isLoading, error } = useGetResourcesForScopedPermissions("packet", filter);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetcher({
        url: `${appConfig.apiUrl()}/pins`,
        body: values,
        method: "POST"
      });
      form.reset();
      setFormOpen(false);
      mutate();
    } catch (error) {
      console.error(error);
      if (error instanceof ApiError && [HttpStatus.BadRequest, HttpStatus.NotFound].includes(error.status)) {
        return form.setError("packetId", { message: error.message });
      }
      setFetchError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="packetId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Packet ID</FormLabel>
              <FormControl>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={popoverOpen}
                      aria-label="Select packet"
                      className="hover:bg-background hover:text-inherit w-full justify-between"
                    >
                      {field.value ? field.value : "Select packet..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder={"Search packet IDs..."}
                        onChangeCapture={(e) => debouncedSetFilter(e.nativeEvent as any)}
                      />
                      <CommandList>
                        {isLoading && <CommandLoading>Loading packet IDs...</CommandLoading>}
                        {error && <CommandEmpty>Error fetching data</CommandEmpty>}
                        <CommandEmpty>No packets found.</CommandEmpty>
                        <CommandGroup>
                          {data?.content
                            ?.sort((a, b) => a.name.localeCompare(b.name))
                            .map((packet) => (
                              <CommandItem
                                key={packet.id}
                                value={packet.id.toString()}
                                onSelect={(currentValue) => {
                                  field.onChange(currentValue);
                                  setFilter("");
                                  setPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === packet.id ? "opacity-100" : "opacity-0"
                                  )}
                                  data-testid={`check-${packet.id}`}
                                />
                                {packet.id} ({packet.name})
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center">
          {form.watch("packetId") && (
            <p className="text-xs font-medium text-muted-foreground ms-4">
              From packet group: &lsquo;{data?.content.find((p) => p.id === form.watch("packetId"))?.name}&rsquo;
            </p>
          )}
          <div className="ms-auto">
            <CustomDialogFooter error={fetchError} onCancel={form.reset} submitText="Add" />
          </div>
        </div>
      </form>
    </Form>
  );
};
