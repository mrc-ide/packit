import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { getRunnerConfigFromLocalStorage } from "@lib/localStorageManager";
import { LocalStorageKeys } from "@lib/types/LocalStorageKeys";
import { ErrorComponent } from "../contents/common/ErrorComponent";
import { useGetRunnerEnabled } from "../header/hooks/useGetRunnerEnabled";

const RunnerConfigContext = createContext<boolean | null>(null);

export const useRunnerConfig = () => useContext(RunnerConfigContext);

interface RunnerConfigProviderProps {
  children: ReactNode;
}

export const RunnerConfigProvider = ({ children }: RunnerConfigProviderProps) => {
  const [runnerEnabled, setRunnerEnabled] = useState<boolean | null>(() => getRunnerConfigFromLocalStorage());
  const { data, error } = useGetRunnerEnabled(runnerEnabled);

  useEffect(() => {
    if (data !== undefined) {
      setRunnerEnabled(data);
      localStorage.setItem(LocalStorageKeys.RUNNER_CONFIG, JSON.stringify(data));
    }
  }, [data]);

  if (error) return <ErrorComponent message="failed to load runner config" error={error} />;

  return <RunnerConfigContext.Provider value={runnerEnabled}>{children}</RunnerConfigContext.Provider>;
};
