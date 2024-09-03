export interface GitBranches {
  defaultBranch: string;
  branches: GitBranchInfo[];
}

export interface GitBranchInfo {
  name: string;
  commitHash: string;
  time: number;
  message: string[];
}
