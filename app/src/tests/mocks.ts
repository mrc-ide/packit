import {Packet, PacketsState} from "../types";

export const mockPacketsState = (props: Partial<PacketsState> = {}): PacketsState => {
    return {
        packets: [],
        packet: {} as Packet,
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
    published: false
};
