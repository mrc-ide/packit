import { Github, RefreshCw } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { KeyedMutator } from "swr";
import { z } from "zod";
import appConfig from "@config/appConfig";
import { fetcher } from "@lib/fetch";
import { getTimeDifferenceToDisplay } from "@lib/time";
import { Button } from "@components/Base/Button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/Base/Form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/Base/Select";
import { Separator } from "@components/Base/Separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/Base/Tooltip";
import { GitBranches, GitBranchInfo } from "../types/GitBranches";
import { packetRunFormSchema } from "./PacketRunForm";

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
  const [isFetching, setIsFetching] = useState(false);

  const gitFetch = async () => {
    setIsFetching(true);
    try {
      await fetcher({
        url: `${appConfig.apiUrl()}/runner/git/fetch`,
        method: "POST"
      });
      mutate();
      setGitFetchError(null);
      toast.success("Git branches fetched successfully.");
    } catch (error) {
      console.error(error);
      setGitFetchError("Failed to fetch git branches. Please try again.");
    } finally {
      setIsFetching(false);
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
              <Button aria-label="git-fetch" size="icon" onClick={gitFetch} type="button" disabled={isFetching}>
                <RefreshCw className={isFetching ? "animate-spin" : ""} />
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
