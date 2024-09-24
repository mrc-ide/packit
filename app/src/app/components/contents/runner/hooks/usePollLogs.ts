import { useEffect, useRef, useState } from "react";
import { Status } from "../types/RunInfo";
import { KeyedMutator } from "swr";

export const usePollLogs = (mutate: KeyedMutator<any>, status?: Status, intervalDuration = 2000) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [, setRenderTrigger] = useState(0); // State variable to trigger re-render on interval

  useEffect(() => {
    if (!status || status === "PENDING" || status === "RUNNING") {
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
  }, [mutate, status]);
};
