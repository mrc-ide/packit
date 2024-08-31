export interface SubmitRunInfo {
  name: string;
  branch: string;
  hash: string;
  parameters?: Record<string, string | number | boolean | null>;
}
