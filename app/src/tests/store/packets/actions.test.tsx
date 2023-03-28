import mockAxios from "../../../../mockAxios";
import {mockPacketResponse} from "../../mocks";
import {actions} from "../../../app/store/packets/thunks";

describe("packet actions", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should get packets from the server successfully", async () => {

        const response = [mockPacketResponse];

        const dispatch = jest.fn();

        const url = "/packet";

        mockAxios.onGet(url)
            .reply(200, response);

        const asyncThunk = actions.fetchPackets();

        await asyncThunk(dispatch, jest.fn(), jest.fn());

        expect(mockAxios.history.get).toHaveLength(1);

        expect(mockAxios.history.get[0].url).toBe(url);

        expect(dispatch.mock.calls.length).toBe(2);

        expect(dispatch.mock.calls[0][0]).toMatchObject({
            type: "GetPackets/pending",
            payload: undefined,
        });

        expect(dispatch.mock.calls[1][0]).toMatchObject({
            type: "GetPackets/fulfilled",
            payload: response,
        });
    });

    it("should handle errors when getting packets from the server", async () => {

        const dispatch = jest.fn();

        const url = "/packet";

        mockAxios.onGet(url)
            .reply(400, "ERROR");

        const asyncThunk = actions.fetchPackets();

        await asyncThunk(dispatch, jest.fn(), jest.fn());

        expect(mockAxios.history.get).toHaveLength(2);

        expect(mockAxios.history.get[0].url).toBe(url);

        expect(dispatch.mock.calls.length).toBe(2);

        expect(dispatch.mock.calls[0][0]).toMatchObject({
            type: "GetPackets/pending",
            payload: undefined,
        });

        expect(dispatch.mock.calls[1][0]).toMatchObject({
            type: "GetPackets/rejected",
            payload: "ERROR",
        });
    });
});
