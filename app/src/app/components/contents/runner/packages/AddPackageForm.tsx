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
import { Input } from "@components/Base/Input";
import { CustomDialogFooter } from "@components/contents/common/CustomDialogFooter";
import { RunnerPackage } from "@/types";

interface AddPackageFormProps {
  mutate: KeyedMutator<RunnerPackage[]>;
  setFormOpen: Dispatch<SetStateAction<boolean>>;
};

export const AddPackageForm = ({ mutate, setFormOpen }: AddPackageFormProps) => {
  const [fetchError, setFetchError] = useState("");

  const formSchema = z.object({
    packageName: z.string().min(2, "Package name must be at least 2 characters long."),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      packageName: "",
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetcher({
        url: `${appConfig.apiUrl()}/runner/packages`,
        body: values,
        method: "POST"
      });
      form.reset();
      setFormOpen(false);
      mutate();
    } catch (error) {
      console.error(error);
      if (error instanceof ApiError && error.status === HttpStatus.BadRequest) {
        return form.setError("packageName", { message: error.message });
      }
      setFetchError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="packageName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Package name</FormLabel>
              <FormControl>
                <Input placeholder="E.g. ggplot2" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <CustomDialogFooter error={fetchError} onCancel={form.reset} submitText="Add" />
      </form>
    </Form>
  );
};
