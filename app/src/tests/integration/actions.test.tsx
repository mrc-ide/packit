import {actions, PacketsMutationType} from "../../app/store/packets/thunks";
import {CustomAsyncThunkOptions, Packet} from "../../types";
import {api} from "../../apiService";
import {createAsyncThunk} from "@reduxjs/toolkit";
describe("backend integration", () => {

    const pageable = {pageNumber: 0, pageSize: 10};

    // TODO mrc-4208 return custom error responses
    it("can parse api errors", async () => {

        const dispatch = jest.fn();
        const asyncThunk = createAsyncThunk<Packet[], void, CustomAsyncThunkOptions>(
            PacketsMutationType.GetPackets,
            async (_, thunkAPI) => api.get("/bad-url", thunkAPI))();

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
        const asyncThunk = actions.fetchPackets(pageable);
        await asyncThunk(dispatch, jest.fn(), jest.fn());

        expect(dispatch.mock.calls[0][0]).toMatchObject({
            type: "GetPackets/pending",
            payload: undefined,
        });
        const result = dispatch.mock.calls[1][0];
        expect(result["type"]).toBe("GetPackets/fulfilled");
        expect(result["payload"]).toHaveLength(5);
        expect(result["payload"].map((p: Packet) => p.name).sort())
            .toEqual(["artefact-types", "computed-resource", "depends", "explicit", "parameters"]);
    });

    it("can fetch packetById", async () => {
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
        expect(result["payload"].name).toBe("explicit");
    });

});
