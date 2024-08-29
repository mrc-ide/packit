import { Check, ChevronsUpDown } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { cn } from "../../../../../lib/cn";
import { Button } from "../../../Base/Button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../../Base/Command";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../Base/Form";
import { Popover, PopoverContent, PopoverTrigger } from "../../../Base/Popover";
import { Skeleton } from "../../../Base/Skeleton";
import { ErrorComponent } from "../../common/ErrorComponent";
import { useGetRunnerPacketGroups } from "../hooks/useGetRunnerPacketGroups";
import { packetRunFormSchema } from "./PacketRunForm";
import { PacketRunParamsField } from "./PacketRunParamsField";

interface PacketRunPacketGroupFieldsProps {
  form: UseFormReturn<z.infer<typeof packetRunFormSchema>>;
  branchName: string;
}
export const PacketRunPacketGroupFields = ({ form, branchName }: PacketRunPacketGroupFieldsProps) => {
  const { packetGroups, isLoading, error } = useGetRunnerPacketGroups(branchName);

  if (error) {
    return <ErrorComponent message="Error loading packet groups" error={error} />;
  }
  if (isLoading) {
    return <Skeleton className="h-12 w-96" />;
  }

  return packetGroups ? (
    <>
      <FormField
        control={form.control}
        name="packetGroupName"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="font-semibold text-lg">Packet Group Name</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn("w-[350px] sm:w-[450px] justify-between", !field.value && "text-muted-foreground")}
                  >
                    {field.value || "Select Packet Group..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] sm:w-[450px] p-0">
                <Command>
                  <CommandInput placeholder="Search Packet Group..." />
                  <CommandList>
                    <CommandEmpty>No packet groups found.</CommandEmpty>
                    <CommandGroup>
                      {packetGroups.map((packetGroupName) => (
                        <CommandItem
                          value={packetGroupName.name}
                          key={packetGroupName.name}
                          onSelect={() => {
                            form.setValue("packetGroupName", packetGroupName.name);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              packetGroupName.name === field.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {packetGroupName.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      <PacketRunParamsField branchName={branchName} form={form} packetGroupName={form.watch("packetGroupName")} />
    </>
  ) : null;
};
