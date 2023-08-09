import packetsReducer, {initialPacketsState} from "../../../app/store/packets/packets";
import {actions} from "../../../app/store/packets/thunks";
import {Custom, Packet, PacketMetadata, TimeMetadata, PageablePackets} from "../../../types";


describe("packetsSlice reducer", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const pageable = {pageNumber: 0, pageSize: 10};

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

        const nextState = packetsReducer(
            initialPacketsState,
            actions.fetchPackets.fulfilled(
                pageablePackets,
                "",
                pageable));

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
            actions.fetchPackets.rejected(null, "", pageable, error)
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
                files: [],
                time: {} as TimeMetadata
            };
        const nextState = packetsReducer(
            initialPacketsState,
            actions.fetchPacketById.fulfilled(packet, "", "1")
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
            actions.fetchPacketById.rejected(null, "", "1", packetError)
        );

        expect(packetState.packet).toEqual({});
        expect(packetState.packetError).toBe(packetError);
    });
});
