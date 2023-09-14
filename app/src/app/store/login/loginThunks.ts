import {AsyncThunk, createAsyncThunk} from "@reduxjs/toolkit";
import {
    CustomAsyncThunkOptions,
    RejectedErrorValue,
    UserLoginDetails
} from "../../../types";
import {api} from "../../../apiService";

export interface LoginActions {
    fetchToken: AsyncThunk<string, UserLoginDetails, RejectedErrorValue>;
    authConfig: AsyncThunk<Record<string, any>, void, RejectedErrorValue>;
}

export enum PacketsMutationType {
    GetToken = "GetToken",
    AuthConfig = "AuthConfig"
}

export const actions: LoginActions = {
    fetchToken: createAsyncThunk<string, UserLoginDetails, CustomAsyncThunkOptions>(
        PacketsMutationType.GetToken,
        async (props, thunkAPI) =>
            api.postAndReturn("/auth/login", props, thunkAPI)),
    authConfig: createAsyncThunk<Record<string, any>, void, CustomAsyncThunkOptions>(
        PacketsMutationType.AuthConfig,
        async (_, thunkAPI) =>
            api.get("/auth/config", thunkAPI))
};