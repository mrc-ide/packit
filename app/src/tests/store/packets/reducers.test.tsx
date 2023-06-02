import packetsReducer, {initialPacketsState} from "../../../app/store/packets/packets";
import {actions} from "../../../app/store/packets/thunks";
import {Packet} from "../../../types";

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
        expect(nextState.error).toBeNull();
    });

    it("should handle fetchPackets.rejected", async () => {
        const error = Error("Could not parse API response");

        const packetState = packetsReducer(
            initialPacketsState,
            actions.fetchPackets.rejected(error, "")
        );

        expect(packetState.packets).toEqual([]);
        expect(packetState.error?.message).toBe(error.message);
    });
});
