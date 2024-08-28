import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { KeyedMutator } from "swr";
import { z } from "zod";
import { Form } from "../../../Base/Form";
import { GitBranches, GitBranchInfo } from "../types/GitBranches";
import { PacketRunBranchField } from "./PacketRunBranchField";

export interface PacketRunFormProps {
  defaultBranch: string;
  branches: GitBranchInfo[];
  mutate: KeyedMutator<GitBranches>;
}
export const packetRunFormSchema = z.object({
  branch: z.string(),
  packetGroupName: z.string(),
  parameters: z.record(z.any())
});
export const PacketRunForm = ({ defaultBranch, branches, mutate }: PacketRunFormProps) => {
  const form = useForm<z.infer<typeof packetRunFormSchema>>({
    resolver: zodResolver(packetRunFormSchema),
    defaultValues: {
      branch: defaultBranch,
      packetGroupName: "",
      parameters: {}
    }
  });

  const onSubmit = async (values: z.infer<typeof packetRunFormSchema>) => {
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <PacketRunBranchField branches={branches} form={form} mutate={mutate} />
      </form>
    </Form>
  );
};
