import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { KeyedMutator } from "swr";
import { z } from "zod";
import appConfig from "@config/appConfig";
import { ApiError } from "@lib/errors";
import { fetcher } from "@lib/fetch";
import { HttpStatus } from "@lib/types/HttpStatus";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/Base/Form";
import { CustomDialogFooter } from "@components/contents/common/CustomDialogFooter";
import { PacketMetadata } from "@/types";
import { PinCheck } from "./PinCheck";
import { packetIdRegex } from "./utils/constants";
import { Input } from "@components/Base/Input";

interface AddPinFormProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
  mutate: KeyedMutator<PacketMetadata[]>;
}
export const AddPinForm = ({ mutate, setOpen }: AddPinFormProps) => {
  const [fetchError, setFetchError] = useState("");

  const formSchema = z.object({
    packetId: z
      .string()
      .min(1)
      .regex(packetIdRegex, "Invalid packet ID format. Example packet ID: 20250130-123456-1a2b3c4d")
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      packetId: ""
    }
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetcher({
        url: `${appConfig.apiUrl()}/pins`,
        body: values,
        method: "POST"
      });
      form.reset();
      setOpen(false);
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
                <Input placeholder={"Enter the ID of the packet you want to pin"} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <PinCheck packetId={form.watch("packetId")} />
        <CustomDialogFooter error={fetchError} onCancel={form.reset} submitText="Add" />
      </form>
    </Form>
  );
};
