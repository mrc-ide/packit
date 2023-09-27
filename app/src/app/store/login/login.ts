import {CurrentUser, LoginState} from "../../../types";
import {createSlice} from "@reduxjs/toolkit";
import {actions} from "./loginThunks";
import {validateToken} from "../../../helpers";
import {CURRENT_USER, saveCurrentUser} from "../../../localStorageManager";

export const initialLoginState: LoginState = {
    user: {} as CurrentUser,
    tokenError: null,
    isAuthenticated: false,
    authConfig: {},
    authConfigError: null
};

export const loginSlice = createSlice({
    name: "login",
    initialState: initialLoginState,
    reducers: {
        logout: (state) => {
            state.user = {} as CurrentUser;
            state.isAuthenticated = false;
            localStorage.removeItem(CURRENT_USER);
        },
        saveUser: (state, action) => {
            state.user = action.payload;
            saveCurrentUser(state.user);
            state.isAuthenticated = validateToken(state.user);
            state.tokenError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(actions.fetchToken.fulfilled, (state, action) => {
                state.user = action.payload;
                saveCurrentUser(state.user);
                state.isAuthenticated = validateToken(state.user);
                state.tokenError = null;
            })
            .addCase(actions.fetchToken.rejected, (state, action) => {
                state.tokenError = action.payload ?? null;
            })
            .addCase(actions.authConfig.fulfilled, (state, action) => {
                state.authConfig = action.payload;
                state.authConfigError = null;
            })
            .addCase(actions.authConfig.rejected, (state, action) => {
                state.authConfigError = action.payload ?? null;
            });
    }
});

export const {logout, saveUser} = loginSlice.actions;

export default loginSlice.reducer;
