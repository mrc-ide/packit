import {createAsyncThunk} from "@reduxjs/toolkit";
import {CurrentUser, CustomAsyncThunkOptions, UserLoginDetailProps} from "../../types";
import {LoginMutationType} from "../../app/store/login/loginThunks";
import {api} from "../../apiService";
import store from "../../app/store/store";

export const login = async (): Promise<CurrentUser> => {

    const testUser = {email: "test.user@example.com", password: "password"};
    const dispatch = jest.fn();
    const fetchTokenThunk = createAsyncThunk<Record<string, any>, UserLoginDetailProps, CustomAsyncThunkOptions>(
        LoginMutationType.GetToken,
        async (prop, thunkAPI) => api(store)
            .postAndReturn("/auth/login", prop, thunkAPI));
    const fetchTokenAction = fetchTokenThunk(testUser);
    await fetchTokenAction(dispatch, jest.fn(), jest.fn());
    const result = dispatch.mock.calls[1][0];
    expect(result["type"]).toBe("GetToken/fulfilled");

    return result["payload"];
};
