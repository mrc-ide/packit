import { Github, RefreshCw } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { KeyedMutator } from "swr";
import { z } from "zod";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { Button } from "../../../Base/Button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../Base/Form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../Base/Select";
import { Separator } from "../../../Base/Separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../Base/Tooltip";
import { GitBranches, GitBranchInfo } from "../types/GitBranches";
import { packetRunFormSchema } from "./PacketRunForm";
import { getTimeDifferenceToDisplay } from "../../../../../lib/time";

interface PacketRunBranchFieldProps {
  branches: GitBranchInfo[];
  selectedBranch: GitBranchInfo | undefined;
  form: UseFormReturn<z.infer<typeof packetRunFormSchema>>;
  mutate: KeyedMutator<GitBranches>;
}

const SelectedBranchInfo = ({ branch }: { branch: GitBranchInfo }) => {
  const lastCommitTime = getTimeDifferenceToDisplay(branch.time)[0];
  return (
    <div className="flex h-6 items-center space-x-2 text-muted-foreground text-sm">
      <Github size={20} />
      <div>{branch.name}</div>
      <Separator orientation="vertical" />
      <div>{branch.commitHash.slice(0, 7)}</div>
      <Separator orientation="vertical" />
      <div>
        Updated {lastCommitTime.value} {lastCommitTime.unit} ago
      </div>
    </div>
  );
};

export const PacketRunBranchField = ({ branches, selectedBranch, form, mutate }: PacketRunBranchFieldProps) => {
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
                <Select defaultValue={field.value ? field.value : undefined} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={branches.length > 0 ? "Select a branch..." : "No branches found"} />
                    </SelectTrigger>
                  </FormControl>
                  {branches.length > 0 && (
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.name} value={branch.name}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  )}
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
      {selectedBranch && <SelectedBranchInfo branch={selectedBranch} />}
    </div>
  );
};
