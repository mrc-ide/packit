import { useEffect } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../../Base/Form";
import { Input } from "../../../Base/Input";
import { Skeleton } from "../../../Base/Skeleton";
import { ErrorComponent } from "../../common/ErrorComponent";
import { useGetParameters } from "../hooks/useGetParameters";
import { packetRunFormSchema } from "./PacketRunForm";

interface PacketRunParamsFieldProps {
  packetGroupName: string | undefined;
  branchCommit: string | undefined;
  form: UseFormReturn<z.infer<typeof packetRunFormSchema>>;
}
export const PacketRunParamsField = ({ packetGroupName, branchCommit, form }: PacketRunParamsFieldProps) => {
  const { parameters, isLoading, error } = useGetParameters(packetGroupName, branchCommit);
  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "parameters"
  });

  useEffect(() => {
    if (parameters) {
      replace(
        parameters.map((param) => ({ name: param.name, value: param.value === null ? "" : param.value.toString() }))
      );
    }
  }, [parameters]);

  if (error) {
    return <ErrorComponent message="Error loading parameters" error={error} />;
  }
  if (isLoading) {
    return <Skeleton className="h-12 w-96" />;
  }

  return (
    <div className="space-y-2">
      <FormLabel className="font-semibold text-lg">Packet group parameters</FormLabel>
      {parameters ? (
        <div className="flex flex-col space-y-3">
          {fields.length == 0 ? (
            <FormDescription>No parameters available for this packet group.</FormDescription>
          ) : (
            <>
              <FormDescription>Fill in parameters with a number, string or boolean</FormDescription>
              {fields.map((item, idx) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name={`parameters.${idx}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex space-x-3 items-center max-w-[450px]">
                        <div>
                          <FormLabel className="font-semibold">{item.name}</FormLabel>
                        </div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </>
          )}
        </div>
      ) : (
        <FormDescription>Select a packet group to see its parameters.</FormDescription>
      )}
    </div>
  );
};
