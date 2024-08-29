export interface RunnerPacketGroup {
  name: string;
  updatedTime: number;
  hasModifications: boolean;
}

export interface Parameter {
  name: string;
  value: number | string | boolean | null;
}
