import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { KeyedMutator } from "swr";
import { z } from "zod";
import appConfig from "../../../../../config/appConfig";
import { ApiError } from "../../../../../lib/errors";
import { fetcher } from "../../../../../lib/fetch";
import { Button } from "../../../Base/Button";
import { Form } from "../../../Base/Form";
import { GitBranches, GitBranchInfo } from "../types/GitBranches";
import { constructSubmitRunBody } from "../utils/constructSubmitRunBody";
import { PacketRunBranchField } from "./PacketRunBranchField";
import { PacketRunPacketGroupFields } from "./PacketRunPacketGroupFields";

export interface PacketRunFormProps {
  defaultBranch: string;
  branches: GitBranchInfo[];
  mutate: KeyedMutator<GitBranches>;
}
export const packetRunFormSchema = z.object({
  branch: z.string({ required_error: "Branch is required" }),
  packetGroupName: z.string({ required_error: "Packet Group name is required" }),
  parameters: z.array(
    z.object({
      name: z.string(),
      value: z
        .string()
        .min(1, "Must enter a number, string or boolean")
        .refine((value) => value !== "null", { message: "Value cannot be null." })
    })
  )
});

export const PacketRunForm = ({ defaultBranch, branches, mutate }: PacketRunFormProps) => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof packetRunFormSchema>>({
    resolver: zodResolver(packetRunFormSchema),
    defaultValues: {
      branch: defaultBranch,
      parameters: []
    }
  });
  const selectedBranch = branches.filter((branch) => branch.name === form.getValues("branch"))[0];

  const onSubmit = async (values: z.infer<typeof packetRunFormSchema>) => {
    const submitRunBody = constructSubmitRunBody(values.parameters, values.packetGroupName, selectedBranch);

    try {
      const { taskId } = await fetcher({
        url: `${appConfig.apiUrl()}/runner/run`,
        method: "POST",
        body: submitRunBody
      });
      navigate(`/runner/logs/${taskId}`);
    } catch (error) {
      console.error(error);
      if (error instanceof ApiError) {
        return form.setError("root", { message: error.message });
      }
      form.setError("root", { message: "An unexpected error occurred. Please try again." });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <PacketRunBranchField branches={branches} selectedBranch={selectedBranch} form={form} mutate={mutate} />
        <PacketRunPacketGroupFields form={form} branchCommit={selectedBranch.commitHash} />
        <Button type="submit" size="lg">
          Run
        </Button>
        {form.formState.errors?.root && (
          <div className="text-xs text-destructive">{form.formState.errors.root.message}</div>
        )}
      </form>
    </Form>
  );
};
