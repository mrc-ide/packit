import { GitBranchInfo } from "../types/GitBranches";
import { SubmitRunInfo } from "../types/SubmitRunInfo";

export const constructSubmitRunBody = (
  parameters: Record<string, string>[],
  packetGroupName: string,
  branch: GitBranchInfo
): SubmitRunInfo => {
  const parsedParameters =
    parameters.length === 0
      ? undefined
      : parameters.reduce(
          (acc, curr) => {
            acc[curr.name] = parseParameterValue(curr.value);
            return acc;
          },
          {} as Record<string, string | number | boolean>
        );

  return {
    name: packetGroupName,
    branch: branch.name,
    hash: branch.commitHash,
    ...(parsedParameters && { parameters: parsedParameters })
  };
};

export const parseParameterValue = (value: string): string | number | boolean => {
  switch (true) {
    case value === "":
      throw new Error("Value cannot be null.");
    case value.toLocaleLowerCase() === "true":
      return true;
    case value.toLocaleLowerCase() === "false":
      return false;
    case !isNaN(Number(value)):
      return Number(value);
    default:
      return value;
  }
};
