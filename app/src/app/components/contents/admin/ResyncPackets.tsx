import {useUser} from "../../providers/UserProvider";
import {hasGlobalPacketManagePermission} from "../../../../lib/auth/hasPermission";
import {Unauthorized} from "../common/Unauthorized";
import {ResyncPacketsButton} from "./ResyncPacketsButton";

export const ResyncPackets = () => {
    const {authorities} = useUser();
    if (!hasGlobalPacketManagePermission(authorities)) {
        return <Unauthorized/>
    } else {
        return <>
            <ResyncPacketsButton />
        </>
    }
}