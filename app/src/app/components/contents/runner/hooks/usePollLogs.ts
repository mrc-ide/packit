import { useEffect, useRef, useState } from "react";
import { KeyedMutator } from "swr";
import { RunInfo } from "../types/RunInfo";
import { isUnfinishedStatus } from "../utils/taskRunUtils";

export const usePollLogs = (mutate: KeyedMutator<any>, runInfos: RunInfo[], intervalDuration = 2000) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [, setRenderTrigger] = useState(0); // State variable to trigger re-render on interval

  useEffect(() => {
    if (runInfos.some((runInfo) => isUnfinishedStatus(runInfo.status))) {
      intervalRef.current = setInterval(() => {
        mutate();
        setRenderTrigger((prev) => prev + 1);
      }, intervalDuration);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mutate, runInfos]);
};
