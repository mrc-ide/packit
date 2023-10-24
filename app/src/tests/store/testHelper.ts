import {HttpStatusCode} from "axios";
import mockAxios from "../../../mockAxios";
import {AsyncThunkAction} from "@reduxjs/toolkit";
import {RejectedErrorValue} from "../../types";

export const expectThunkActionWith = async <S, T>(
    dispatch: jest.Mock,
    response: S,
    statusCode: HttpStatusCode,
    asyncThunk: AsyncThunkAction<S, T, RejectedErrorValue>,
    mutationType: string,
    url: string
) => {
    mockAxios.onGet(url)
        .reply(statusCode, response);

    mockAxios.onPost(url)
        .reply(statusCode, response);

    await asyncThunk(dispatch, jest.fn(), jest.fn());

    if (mockAxios.history.get.length > 0) {
        expect(mockAxios.history.get).toHaveLength(1);
        expect(mockAxios.history.get[0].url).toBe(url);
    } else {
        expect(mockAxios.history.post).toHaveLength(1);
        expect(mockAxios.history.post[0].url).toBe(url);
    }

    expect(dispatch.mock.calls.length).toBe(2);

    expect(dispatch.mock.calls[0][0]).toMatchObject({
        type: `${mutationType}/pending`,
        payload: undefined,
    });

    if (statusCode === 200) {
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
