import {actions, PacketsMutationType} from "../../app/store/packets/thunks";
import {Packet} from "../../types";
import {api} from "../../apiService";
describe("backend integration", () => {

    // TODO mrc-4208 return custom error responses
    it("can parse api errors", async () => {

        const dispatch = jest.fn();
        const asyncThunk = api.get<Packet[], void>(PacketsMutationType.GetPackets, "/bad-url")();
        await asyncThunk(dispatch, jest.fn(), jest.fn());

        expect(dispatch.mock.calls[0][0]).toMatchObject({
            type: "GetPackets/pending",
            payload: undefined,
        });
        const result = dispatch.mock.calls[1][0];
        expect(result["type"]).toBe("GetPackets/rejected");
        expect(result["payload"]["error"]).toBe("Not Found");
    });

    it("can fetch packets", async () => {

        const dispatch = jest.fn();
        const asyncThunk = actions.fetchPackets();
        await asyncThunk(dispatch, jest.fn(), jest.fn());

        expect(dispatch.mock.calls[0][0]).toMatchObject({
            type: "GetPackets/pending",
            payload: undefined,
        });
        const result = dispatch.mock.calls[1][0];
        expect(result["type"]).toBe("GetPackets/fulfilled");
        expect(result["payload"]).toHaveLength(4);
        expect(result["payload"].map((p: Packet) => p.name).sort())
            .toEqual(["computed-resource", "depends", "explicit", "parameters"]);
    });

    it("can fetch packet by ID", async () => {
        const dispatch = jest.fn();
        const asyncThunk = actions.fetchPacketById("20230427-150755-2dbede93");
        await asyncThunk(dispatch, jest.fn(), jest.fn());

        expect(dispatch.mock.calls[0][0]).toMatchObject({
            type: "GetPacket/pending",
            payload: undefined,
        });
        const result = dispatch.mock.calls[1][0];
        expect(result["type"]).toBe("GetPacket/fulfilled");
        expect(result["payload"].id).toBe("20230427-150755-2dbede93");
        expect(result["payload"].displayName).toBe("explicit");
    });

});
