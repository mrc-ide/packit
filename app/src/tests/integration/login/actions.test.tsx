import {LoginMutationType} from "../../../app/store/login/loginThunks";
import {CustomAsyncThunkOptions, UserLoginDetailProps} from "../../../types";
import {api} from "../../../apiService";
import {createAsyncThunk} from "@reduxjs/toolkit";
import store from "../../../app/store/store";

describe("login integration", () => {

    it("can get auth config", async () => {

        const dispatch = jest.fn();
        const asyncThunk = createAsyncThunk<Record<string, any>, void, CustomAsyncThunkOptions>(
            LoginMutationType.GetAuthConfig,
            async (_, thunkAPI) => api(store).get("/auth/config", thunkAPI))();

        await asyncThunk(dispatch, store.getState, jest.fn());

        expect(dispatch.mock.calls[0][0]).toMatchObject({
            type: "GetAuthConfig/pending",
            payload: undefined,
        });
        const result = dispatch.mock.calls[1][0];
        expect(result["type"]).toBe("GetAuthConfig/fulfilled");
        expect(result["payload"]).toEqual(
            {
                "enableFormLogin": true,
                "enableGithubLogin": true,
                "enableAuth": true
            });
    });

    it("can get token", async () => {
        const testUser = {email: "test.user@example.com", password: "password"};
        const dispatch = jest.fn();

        const fetchTokenThunk = createAsyncThunk<Record<string, any>, UserLoginDetailProps, CustomAsyncThunkOptions>(
            LoginMutationType.GetToken,
            async (prop, thunkAPI) => api(store)
                .postAndReturn("/auth/login", prop, thunkAPI));

        const fetchTokenAction = fetchTokenThunk(testUser);

        await fetchTokenAction(dispatch, jest.fn(), jest.fn());

        expect(dispatch.mock.calls[0][0]).toMatchObject({
            type: "GetToken/pending",
            payload: undefined,
        });
        const result = dispatch.mock.calls[1][0];
        expect(result["type"]).toBe("GetToken/fulfilled");
        expect(result["payload"].token).toBeTruthy();
    });
});
