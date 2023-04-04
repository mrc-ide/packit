import mockAxios from "../../../../mockAxios";
import {mockPacketResponse} from "../../mocks";
import {actions} from "../../../app/store/packets/thunks";
import {Packet} from "../../../types";

describe("packet actions", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockAxios.reset();
    });

    it("should fetch packets as expected", async () => {

        const response = [mockPacketResponse];

        const dispatch = jest.fn();

        await expectPendingFetchPackets(dispatch, response, 200);

        expect(dispatch.mock.calls[1][0]).toMatchObject({
            type: "GetPackets/fulfilled",
            payload: response,
        });
    });

    it("should handle errors when fetching packets when response as error data", async () => {

        const dispatch = jest.fn();

        await expectPendingFetchPackets(dispatch, "ERROR");

        expect(dispatch.mock.calls[1][0]).toMatchObject({
            type: "GetPackets/rejected",
            payload: "ERROR",
        });
    });

    it("should handle errors when fetching packets when empty response data", async () => {

        const dispatch = jest.fn();

        await expectPendingFetchPackets(dispatch);

        expect(dispatch.mock.calls[1][0].type).toBe("GetPackets/rejected");
        expect(dispatch.mock.calls[1][0].error).toEqual({
            message: "Rejected"
        });
    });
});

const expectPendingFetchPackets = async (
    dispatch: jest.Mock,
    response: string | Packet[] = "",
    statusCode = 400) => {

    const url = "/packets";

    mockAxios.onGet(url)
        .reply(statusCode, response);

    const asyncThunk = actions.fetchPackets();

    await asyncThunk(dispatch, jest.fn(), jest.fn());

    expect(mockAxios.history.get).toHaveLength(1);

    expect(mockAxios.history.get[0].url).toBe(url);

    expect(dispatch.mock.calls.length).toBe(2);

    expect(dispatch.mock.calls[0][0]).toMatchObject({
        type: "GetPackets/pending",
        payload: undefined,
    });
};
