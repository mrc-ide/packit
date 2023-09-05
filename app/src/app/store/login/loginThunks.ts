import {AsyncThunk, createAsyncThunk} from "@reduxjs/toolkit";
import {
    CustomAsyncThunkOptions,
    RejectedErrorValue,
    UserLoginDetails
} from "../../../types";
import {api} from "../../../apiService";

export interface LoginActions {
    fetchToken: AsyncThunk<string, UserLoginDetails, RejectedErrorValue>;
}

export enum PacketsMutationType {
    GetToken = "GetToken"
}

export const actions: LoginActions = {
    fetchToken: createAsyncThunk<string, UserLoginDetails, CustomAsyncThunkOptions>(
        PacketsMutationType.GetToken,
        async (props, thunkAPI) =>
            api.postAndReturn("/auth/login", props, thunkAPI)),
};
