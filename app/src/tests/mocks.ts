
import {Custom, PacketMetadata, PacketsState, PageablePackets} from "../types";

export const mockPacketsState = (props: Partial<PacketsState> = {}): PacketsState => {
    return {
        packets: [],
        pageablePackets: {} as PageablePackets,
        packet: {} as PacketMetadata,
        fetchPacketsError: null,
        packetError: null,
        ...props
    };
};

export const mockPacketResponse = {
    id: "52fd88b2-8ee8-4ac0-a0e5-41b9a15554a4",
    name: "Interim update for covid impact iu touchstone2",
    displayName: "touchstone",
    parameters: {
        "city_subset": "63f730b9fc13ae1df6000070"
    },
    custom: {} as Custom,
    files: [{hash: "sha:234:50873fVFDSVSF4", path: "data.rds", size: 97}],
    published: false
};
