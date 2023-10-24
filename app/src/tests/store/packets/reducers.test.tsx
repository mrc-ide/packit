import packetsReducer, {initialPacketsState} from "../../../app/store/packets/packets";
import {actions} from "../../../app/store/packets/packetThunks";
import {Custom, Packet, PacketMetadata, TimeMetadata, PageablePackets} from "../../../types";

describe("packetsSlice reducer", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should handle fetchPackets.fulfilled", () => {
        const packets: Packet[] = [
            {
                id: "1",
                name: "packet-1",
                displayName: "Packet 1",
                published: true,
                parameters: {
                    param1: "value1",
                    param2: "value2",
                },
            },
            {
                id: "2",
                name: "packet-2",
                displayName: "Packet 2",
                published: false,
                parameters: {
                    param1: "value1",
                    param2: "value2",
                    param3: "value3",
                },
            }];

        const pageablePackets = {content: packets} as PageablePackets;

        const packetState = packetsReducer(initialPacketsState, {
            type: actions.fetchPackets.fulfilled.type,
            payload: pageablePackets,
        });

        expect(packetState.pageablePackets.content).toEqual(packets);

        expect(packetState.fetchPacketsError).toBeNull();
    });

    it("should handle fetchPackets.rejected", async () => {
        const error = {
            error: {
                detail: "FAKE ERROR",
                error: "OTHER_ERROR"
            }
        };

        const packetState = packetsReducer(initialPacketsState, {
            type: actions.fetchPackets.rejected.type,
            payload: error,
        });

        expect(packetState.pageablePackets).toEqual({});

        expect(packetState.fetchPacketsError).toBe(error);
    });

    it("should handle fetchPackets.fulfilled", () => {
        const packet: PacketMetadata =
            {
                id: "1",
                name: "packet-1",
                displayName: "Packet 1",
                published: true,
                parameters: {
                    param1: "value1",
                    param2: "value2",
                },
                custom: {} as Custom,
                files: [],
                time: {} as TimeMetadata
            };

        const packetState = packetsReducer(initialPacketsState, {
            type: actions.fetchPacketById.fulfilled.type,
            payload: packet,
        });

        expect(packetState.packet).toEqual(packet);

        expect(packetState.fetchPacketsError).toBeNull();
    });

    it("should handle fetchPacketById when rejected", async () => {
        const packetError = {
            error: {
                detail: "Packet does not exist",
                error: "OTHER_ERROR"
            }
        };

        const packetState = packetsReducer(initialPacketsState, {
            type: actions.fetchPacketById.rejected.type,
            payload: packetError,
        });

        expect(packetState.packet).toEqual({});

        expect(packetState.packetError).toBe(packetError);
    });
});
