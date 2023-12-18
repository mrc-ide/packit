import {AsyncThunk, createAsyncThunk} from "@reduxjs/toolkit";
import {
    CustomAsyncThunkOptions,
    RejectedErrorValue
} from "../../../types";
import {api} from "../../../apiService";

export interface LoginActions {
    fetchAuthConfig: AsyncThunk<Record<string, any>, void, RejectedErrorValue>;
}

export enum LoginMutationType {
    GetToken = "GetToken",
    GetAuthConfig = "GetAuthConfig"
}

export const actions: LoginActions = {
    fetchAuthConfig: createAsyncThunk<Record<string, any>, void, CustomAsyncThunkOptions>(
        LoginMutationType.GetAuthConfig,
        async (_, thunkAPI) =>
            api().get("/auth/config", thunkAPI))
};
