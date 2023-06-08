import {HttpStatusCode} from "axios";
import mockAxios from "../../../mockAxios";

export const expectThunkActionWith = async (
    dispatch: jest.Mock,
    response: any,
    statusCode: HttpStatusCode,
    asyncThunk: any,
    mutationType: string,
    url: string
) => {
    mockAxios.onGet(url)
        .reply(statusCode, response);

    await asyncThunk(dispatch, jest.fn(), jest.fn());

    expect(mockAxios.history.get).toHaveLength(1);

    expect(mockAxios.history.get[0].url).toBe(url);

    expect(dispatch.mock.calls.length).toBe(2);

    expect(dispatch.mock.calls[0][0]).toMatchObject({
        type: `${mutationType}/pending`,
        payload: undefined,
    });

    if (statusCode == 200) {
        expect(dispatch.mock.calls[1][0]).toMatchObject({
            type: `${mutationType}/fulfilled`,
            payload: response,
        });
    } else {
        expect(dispatch.mock.calls[1][0]).toMatchObject({
            type: `${mutationType}/rejected`,
            payload: response,
        });
        expect(dispatch.mock.calls[1][0].error).toEqual({
            message: "Rejected"
        });
    }
};
