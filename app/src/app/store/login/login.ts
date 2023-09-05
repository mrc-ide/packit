import {LoginState} from "../../../types";
import {createSlice} from "@reduxjs/toolkit";
import {actions} from "./loginThunks";

export const initialLoginState: LoginState = {
    token: "",
    tokenError: null
};

export const loginSlice = createSlice({
    name: "login",
    initialState: initialLoginState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(actions.fetchToken.fulfilled, (state, action) => {
                localStorage.setItem("token", action.payload);
                state.token = action.payload;
                state.tokenError = null;
            })
            .addCase(actions.fetchToken.rejected, (state, action) => {
                state.tokenError = action.payload ?? null;
            });
    }
});

export default loginSlice.reducer;
