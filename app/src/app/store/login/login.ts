import {LoginState} from "../../../types";
import {createSlice} from "@reduxjs/toolkit";
import {actions} from "./loginThunks";
import {validateToken} from "../../../helpers";

export const initialLoginState: LoginState = {
    token: "",
    tokenError: null,
    isAuthenticated: false
};

export const loginSlice = createSlice({
    name: "login",
    initialState: initialLoginState,
    reducers: {
        logout: (state) => {
            state.token = "";
            state.isAuthenticated = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(actions.fetchToken.fulfilled, (state, action) => {
                state.token = action.payload;
                state.isAuthenticated = validateToken(state.token);
                state.tokenError = null;
            })
            .addCase(actions.fetchToken.rejected, (state, action) => {
                state.tokenError = action.payload ?? null;
            });
    }
});

export const {logout} = loginSlice.actions;
export default loginSlice.reducer;
