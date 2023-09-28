import {AsyncThunk, createAsyncThunk} from "@reduxjs/toolkit";
import {
    CurrentUser,
    CustomAsyncThunkOptions,
    RejectedErrorValue,
    UserLoginDetailProps
} from "../../../types";
import {api} from "../../../apiService";

export interface LoginActions {
    fetchToken: AsyncThunk<CurrentUser, UserLoginDetailProps, RejectedErrorValue>;
    fetchAuthConfig: AsyncThunk<Record<string, any>, void, RejectedErrorValue>;
}

export enum LoginMutationType {
    GetToken = "GetToken",
    GetAuthConfig = "GetAuthConfig"
}

export const actions: LoginActions = {
    fetchToken: createAsyncThunk<CurrentUser, UserLoginDetailProps, CustomAsyncThunkOptions>(
        LoginMutationType.GetToken,
        async (props, thunkAPI) =>
            api().postAndReturn("/auth/login", props, thunkAPI)),
    fetchAuthConfig: createAsyncThunk<Record<string, any>, void, CustomAsyncThunkOptions>(
        LoginMutationType.GetAuthConfig,
        async (_, thunkAPI) =>
            api().get("/auth/config", thunkAPI))
};
