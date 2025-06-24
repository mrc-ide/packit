import { toast } from "sonner";
import appConfig from "../../../../../config/appConfig";
import { fetcher } from "../../../../../lib/fetch";
import { useState } from "react";

export const useCancelTask = (taskId: string) => {
  const [cancelInitiated, setCancelInitiated] = useState(false);

  const cancelTask = async () => {
    setCancelInitiated(true);
    try {
      await fetcher({
        url: `${appConfig.apiUrl()}/runner/cancel/${taskId}`,
        method: "POST"
      });
    } catch (error) {
      console.error("Error cancelling task:", error);
      toast.error("failed to cancel task");
      setCancelInitiated(false);
    }
  };

  return { cancelTask, cancelInitiated };
};
