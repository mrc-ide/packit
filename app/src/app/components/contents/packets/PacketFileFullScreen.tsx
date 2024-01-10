import {useParams} from "react-router-dom";
import {useGetPacketById} from "../common/hooks/useGetPacketById";
import {ErrorComponent} from "../common/ErrorComponent";
import {PacketReport} from "./PacketReport";

export const PacketFileFullScreen = () => {
    const { packetId, fileName } = useParams();
    const { packet, error } = useGetPacketById(packetId);

    if (error) {
        return <ErrorComponent error={error} message="Error Fetching Packet details" />;
    }

    return packet && fileName ? <PacketReport packet={packet} fileName={fileName}/> : null;
};
