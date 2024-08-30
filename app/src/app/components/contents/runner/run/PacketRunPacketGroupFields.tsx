import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Skeleton } from "../../../Base/Skeleton";
import { ErrorComponent } from "../../common/ErrorComponent";
import { useGetRunnerPacketGroups } from "../hooks/useGetRunnerPacketGroups";
import { packetRunFormSchema } from "./PacketRunForm";
import { PacketRunPacketGroupField } from "./PacketRunPacketGroupField";
import { PacketRunParamsField } from "./PacketRunParamsField";

interface PacketRunPacketGroupFieldsProps {
  form: UseFormReturn<z.infer<typeof packetRunFormSchema>>;
  branchCommit: string;
}
export const PacketRunPacketGroupFields = ({ form, branchCommit }: PacketRunPacketGroupFieldsProps) => {
  const { packetGroups, isLoading, error } = useGetRunnerPacketGroups(branchCommit);

  if (error) {
    return <ErrorComponent message="Error loading packet groups" error={error} />;
  }
  if (isLoading) {
    return <Skeleton className="h-12 w-96" />;
  }

  return packetGroups ? (
    <>
      <PacketRunPacketGroupField form={form} packetGroups={packetGroups} />
      <PacketRunParamsField branchCommit={branchCommit} form={form} packetGroupName={form.watch("packetGroupName")} />
    </>
  ) : null;
};
