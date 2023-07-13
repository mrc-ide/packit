import packetsReducer, {initialPacketsState} from "../../../app/store/packets/packets";
import {actions} from "../../../app/store/packets/thunks";
import {Custom, Packet, PacketMetadata} from "../../../types";

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
        const nextState = packetsReducer(initialPacketsState, actions.fetchPackets.fulfilled(packets, ""));

        expect(nextState.packets).toEqual(packets);
        expect(nextState.fetchPacketsError).toBeNull();
    });

    it("should handle fetchPackets.rejected", async () => {
        const error = {
            error: {
                detail: "FAKE ERROR",
                error: "OTHER_ERROR"
            }
        };

        const packetState = packetsReducer(
            initialPacketsState,
            actions.fetchPackets.rejected(null, "", undefined, error)
        );

        expect(packetState.packets).toEqual([]);
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
                files: []
            };
        const nextState = packetsReducer(
            initialPacketsState,
            actions.fetchPacketMetadataById.fulfilled(packet, "", "1")
        );

        expect(nextState.packet).toEqual(packet);
        expect(nextState.fetchPacketsError).toBeNull();
    });

    it("should handle fetchPacketById when rejected", async () => {
        const packetError = {
            error: {
                detail: "Packet does not exist",
                error: "OTHER_ERROR"
            }
        };

        const packetState = packetsReducer(
            initialPacketsState,
            actions.fetchPacketMetadataById.rejected(null, "", "1", packetError)
        );

        expect(packetState.packet).toEqual({});
        expect(packetState.packetError).toBe(packetError);
    });
});
