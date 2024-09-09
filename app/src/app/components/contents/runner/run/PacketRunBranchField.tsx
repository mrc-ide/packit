import { Github, RefreshCw } from "lucide-react";
import { Button } from "../../../Base/Button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../Base/Form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../Base/Select";
import { Separator } from "../../../Base/Separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../Base/Tooltip";
import { GitBranches, GitBranchInfo } from "../types/GitBranches";
import { getTimeDifferenceToDisplay } from "../../explorer/utils/getTimeDifferenceToDisplay";
import { KeyedMutator } from "swr";
import { fetcher } from "../../../../../lib/fetch";
import appConfig from "../../../../../config/appConfig";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { packetRunFormSchema } from "./PacketRunForm";
import { useState } from "react";

interface PacketRunBranchFieldProps {
  branches: GitBranchInfo[];
  selectedBranch: GitBranchInfo;
  form: UseFormReturn<z.infer<typeof packetRunFormSchema>>;
  mutate: KeyedMutator<GitBranches>;
}
export const PacketRunBranchField = ({ branches, selectedBranch, form, mutate }: PacketRunBranchFieldProps) => {
  const lastCommitTime = getTimeDifferenceToDisplay(selectedBranch.time);
  const [gitFetchError, setGitFetchError] = useState<string | null>(null);

  const gitFetch = async () => {
    try {
      await fetcher({
        url: `${appConfig.apiUrl()}/runner/git/fetch`,
        method: "POST"
      });
      mutate();
      setGitFetchError(null);
    } catch (error) {
      console.error(error);
      setGitFetchError("Failed to fetch git branches. Please try again.");
    }
  };

  return (
    <div className="space-y-2">
      <FormLabel className="font-semibold text-lg">Branch</FormLabel>
      <div className="flex space-x-3">
        <div className="flex-grow">
          <FormField
            control={form.control}
            name="branch"
            render={({ field }) => (
              <FormItem>
                <Select defaultValue={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a branch..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.commitHash} value={branch.name}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button aria-label="git-fetch" size="icon" onClick={gitFetch} type="button">
                <RefreshCw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fetch git branches</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {gitFetchError && <div className="text-red-500 text-xs">{gitFetchError}</div>}
      <div className="flex h-6 items-center space-x-2 text-muted-foreground text-sm">
        <Github size={20} />
        <div>{selectedBranch.name}</div>
        <Separator orientation="vertical" />
        <div>{selectedBranch.commitHash.slice(0, 7)}</div>
        <Separator orientation="vertical" />
        <div>
          Updated {lastCommitTime.value} {lastCommitTime.unit} ago
        </div>
      </div>
    </div>
  );
};
