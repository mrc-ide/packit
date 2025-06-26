import {Button} from "../../Base/Button";
import {RefreshCw} from "lucide-react";
import {useState} from "react";
import {fetcher} from "../../../../lib/fetch";
import appConfig from "../../../../config/appConfig";
import {cn} from "../../../../lib/cn";

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
        } catch (error) {
            console.error(error);
            setError("Failed to resync. Please try again.");
        }
        setPending(false);
    };

    return <div className="">
        <Button aria-label="resync-packets" onClick={resyncPackets} type="button" className="w-[10rem]" disabled={pending}>
            <RefreshCw className="p-1" /> Resync Packets
        </Button>
        <div className={cn("text-sm pace-y-1 h-[1rem]", error ? "text-destructive" : "")}>
            { pending ? "Resync in progress..." : error}
        </div>
    </div>
}
