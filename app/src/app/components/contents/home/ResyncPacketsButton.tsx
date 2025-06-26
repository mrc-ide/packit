import {Button} from "../../Base/Button";
import {RefreshCw} from "lucide-react";
import {useState} from "react";
import {fetcher} from "../../../../lib/fetch";
import appConfig from "../../../../config/appConfig";

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

// TODO: show error and pending

export const ResyncPacketsButton = () => {
    return  <Button aria-label="git-fetch" size="icon" onClick={resyncPackets} type="button">
        <RefreshCw /> Refresh Packets
    </Button>
}