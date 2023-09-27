import {ApiService} from "../apiService";
import mockAxios from "../../mockAxios";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {CustomAsyncThunkOptions} from "../types";
import thunk from "redux-thunk";
import configureStore from "redux-mock-store";
import {mockLoginState, mockPacketsState} from "./mocks";

describe("api service", () => {

    beforeEach(() => {
        mockAxios.reset();
        jest.clearAllMocks();
    });

    const getStore = () => {
        const middlewares = [thunk];
        const mockStore = configureStore(middlewares);
        const initialRootStates = {
            packets: mockPacketsState(),
            login: mockLoginState()
        };

        return mockStore(initialRootStates);
    };

    it("executes async GET method successfully", async () => {

        const responseData = {data: "test data"};

        const url = "/test";

        const type = "testType";

        mockAxios.onGet(url).reply(200, responseData);

        const api = new ApiService(getStore());

        const asyncThunk = createAsyncThunk<typeof responseData, void, CustomAsyncThunkOptions>(
            type, async (_, thunkAPI) => api.get(url, thunkAPI))();

        const dispatch = jest.fn();

        await asyncThunk(dispatch, jest.fn(), jest.fn());

        expect(mockAxios.history.get).toHaveLength(1);

        expect(mockAxios.history.get[0].url).toBe("/test");

        expect(dispatch).toHaveBeenCalledTimes(2);

        expect(dispatch.mock.calls[0][0]).toMatchObject({
            type: `${type}/pending`,
            payload: undefined
        });

        expect(dispatch.mock.calls[1][0]).toMatchObject({
            type: `${type}/fulfilled`,
            payload: responseData
        });
    });

    it("executes async GET method with error", async () => {

        const errorResponse = {data: "test error message"};

        const url = "/test";

        const type = "testType";

        mockAxios.onGet(url).reply(400, errorResponse);

        const api = new ApiService(getStore());

        const asyncThunk = createAsyncThunk<string, void, CustomAsyncThunkOptions>(
            type, async (_, thunkAPI) => api.get(url, thunkAPI))();

        const dispatch = jest.fn();

        await asyncThunk(dispatch, jest.fn(), jest.fn());

        expect(mockAxios.history.get).toHaveLength(1);

        expect(mockAxios.history.get[0].url).toBe("/test");

        expect(dispatch).toHaveBeenCalledTimes(2);

        expect(dispatch.mock.calls[0][0]).toMatchObject({
            type: `${type}/pending`,
            payload: undefined
        });

        expect(dispatch.mock.calls[1][0]).toMatchObject({
            type: `${type}/rejected`,
            error: {"message": "Rejected"},
            payload: errorResponse
        });
    });
});
