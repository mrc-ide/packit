import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { KeyedMutator } from "swr";
import { z } from "zod";
import { Button } from "../../../Base/Button";
import { Form } from "../../../Base/Form";
import { GitBranches, GitBranchInfo } from "../types/GitBranches";
import { PacketRunBranchField } from "./PacketRunBranchField";
import { PacketRunPacketGroupFields } from "./PacketRunPacketGroupFields";
import { parseParameterValue } from "../utils/parseParameterValue";

export interface PacketRunFormProps {
  defaultBranch: string;
  branches: GitBranchInfo[];
  mutate: KeyedMutator<GitBranches>;
}
export const packetRunFormSchema = z.object({
  branch: z.string({ required_error: "Branch is required" }),
  packetGroupName: z.string({ required_error: "Packet Group name is required" }),
  parameters: z.array(z.object({ name: z.string(), value: z.any() }))
});
export const PacketRunForm = ({ defaultBranch, branches, mutate }: PacketRunFormProps) => {
  const form = useForm<z.infer<typeof packetRunFormSchema>>({
    resolver: zodResolver(packetRunFormSchema),
    defaultValues: {
      branch: defaultBranch,
      parameters: []
    }
  });

  const onSubmit = async (values: z.infer<typeof packetRunFormSchema>) => {
    const parametersMap =
      values.parameters.length === 0
        ? undefined
        : values.parameters.reduce(
            (acc, curr) => {
              acc[curr.name] = parseParameterValue(curr.value);
              return acc;
            },
            {} as Record<string, string | number | boolean | null>
          );

    console.log(parametersMap);
    // TODO: construct the payload SubmitRun to the server - next pr
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <PacketRunBranchField branches={branches} form={form} mutate={mutate} />
        <PacketRunPacketGroupFields form={form} branchName={form.watch("branch")} />
        <Button type="submit" size="lg">
          Run
        </Button>
      </form>
    </Form>
  );
};
