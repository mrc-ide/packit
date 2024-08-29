import { useFieldArray, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { packetRunFormSchema } from "./PacketRunForm";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../../Base/Form";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import useSWR from "swr";
import { Parameter } from "../types/RunnerPacketGroup";
import { ErrorComponent } from "../../common/ErrorComponent";
import { Skeleton } from "../../../Base/Skeleton";
import { useEffect } from "react";
import { Input } from "../../../Base/Input";

interface PacketRunParamsFieldProps {
  packetGroupName: string;
  branchName: string;
  form: UseFormReturn<z.infer<typeof packetRunFormSchema>>;
}
export const PacketRunParamsField = ({ packetGroupName, branchName, form }: PacketRunParamsFieldProps) => {
  const { data, isLoading, error } = useSWR<Parameter[]>(
    packetGroupName ? `${appConfig.apiUrl()}/runner/${packetGroupName}/parameters?ref=${branchName}` : null,
    (url: string) => fetcher({ url })
  );
  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "parameters"
  });

  useEffect(() => {
    if (data) {
      replace(data.map((param) => ({ ...param, value: param.value ?? "" })));
    }
  }, [data]);

  if (error) {
    return <ErrorComponent message="Error loading parameters" error={error} />;
  }
  if (isLoading) {
    return <Skeleton className="h-12 w-96" />;
  }

  return (
    <div className="space-y-2">
      <FormLabel className="font-semibold text-lg">Packet Group Parameters</FormLabel>
      {data ? (
        <div className="flex flex-col space-y-3">
          {fields.length == 0 ? (
            <FormDescription>No parameters available for this packet group.</FormDescription>
          ) : (
            <>
              <FormDescription>
                Fill in parameters with a number, string, boolean or leave empty for null value
              </FormDescription>
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
