import { Button } from "../../Base/Button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { fetcher } from "../../../../lib/fetch";
import appConfig from "../../../../config/appConfig";
import { cn } from "../../../../lib/cn";
import {toast} from "sonner";

export const ResyncPacketsButton = () => {
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const resyncPackets = async () => {
    try {
      setPending(true);
      setError(null);
      await fetcher({
        url: `${appConfig.apiUrl()}/packets/resync`,
        method: "POST"
      });
      toast.success("Resync packets completed successfully.");
    } catch (error) {
      console.error(error);
      setError("Failed to resync. Please try again.");
    }
    setPending(false);
  };

  return (
    <div className="">
      <Button onClick={resyncPackets} type="button" className="w-[10rem]" disabled={pending}>
        <RefreshCw className={cn("p-1", pending ? "animate-spin" : "")} /> Resync packets
      </Button>
      <div className={cn("text-sm pace-y-1 h-[1rem]", error ? "text-destructive" : "")}>
        {error}
      </div>
    </div>
  );
};
