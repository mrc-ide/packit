import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { getRunnerConfigFromSessionStorage, setRunnerConfigInSessionStorage } from "@lib/storageManager";
import { ErrorComponent } from "../contents/common/ErrorComponent";
import { useGetRunnerEnabled } from "../header/hooks/useGetRunnerEnabled";

const RunnerConfigContext = createContext<boolean | null>(null);

export const useRunnerConfig = () => useContext(RunnerConfigContext);

interface RunnerConfigProviderProps {
  children: ReactNode;
}

export const RunnerConfigProvider = ({ children }: RunnerConfigProviderProps) => {
  const [runnerEnabled, setRunnerEnabled] = useState<boolean | null>(() => getRunnerConfigFromSessionStorage());
  const { isRunnerEnabled, isLoading, error } = useGetRunnerEnabled(runnerEnabled);

  useEffect(() => {
    if (isRunnerEnabled !== undefined) {
      setRunnerEnabled(isRunnerEnabled);
      setRunnerConfigInSessionStorage(isRunnerEnabled);
    }
  }, [isRunnerEnabled]);

  if (error) return <ErrorComponent message="failed to load runner config" error={error} />;

  return <RunnerConfigContext.Provider value={isLoading ? null : runnerEnabled}>{children}</RunnerConfigContext.Provider>;
};
