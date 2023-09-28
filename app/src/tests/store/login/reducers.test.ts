import loginReducer, {initialLoginState} from "../../../app/store/login/login";
import {actions} from "../../../app/store/login/loginThunks";
import {CurrentUser} from "../../../types";
import {getCurrentUser} from "../../../localStorageManager";


describe("login reducer", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    const fetchUserResponse: CurrentUser = {token: "fakeToken"};

    const authConfigResponse = {"TEST": "TEST"};

    it("should handle fetchToken.fulfilled", () => {
        const loginState = loginReducer(initialLoginState, {
            type: actions.fetchToken.fulfilled.type,
            payload: fetchUserResponse,
        });

        expect(loginState.user).toEqual(fetchUserResponse);

        expect(loginState.userError).toBeNull();
    });

    it("should handle fetchToken.rejected", async () => {
        const error = {
            error: {
                detail: "FAKE ERROR",
                error: "OTHER_ERROR"
            }
        };

        const loginState = loginReducer(initialLoginState, {
            type: actions.fetchToken.rejected.type,
            payload: error,
        });

        expect(loginState.user).toEqual({});
        expect(loginState.userError).toBe(error);
    });

    it("should handle fetchAuthConfig.fulfilled", () => {
        const loginState = loginReducer(initialLoginState, {
            type: actions.fetchAuthConfig.fulfilled.type,
            payload: authConfigResponse,
        });

        expect(loginState.authConfig).toEqual(authConfigResponse);
        expect(loginState.authConfigError).toBeNull();
    });

    it("should handle fetchAuthConfig.rejected", async () => {
        const error = {
            error: {
                detail: "FAKE ERROR",
                error: "OTHER_ERROR"
            }
        };

        const loginState = loginReducer(initialLoginState, {
            type: actions.fetchAuthConfig.rejected.type,
            payload: error,
        });

        expect(loginState.authConfig).toEqual({});
        expect(loginState.authConfigError).toBe(error);
    });

    it("should handle logout", () => {
        //Authenticated state
        const loginState = loginReducer(initialLoginState, {
            type: actions.fetchToken.fulfilled.type,
            payload: fetchUserResponse,
        });

        expect(loginState.user).toEqual(fetchUserResponse);
        expect(loginState.isAuthenticated).toEqual(true);
        expect(getCurrentUser()).toEqual(fetchUserResponse);

        //Logout state
        const loginStateLogout = loginReducer(initialLoginState, {
            type: "LOGOUT"
        });

        expect(loginStateLogout.user).toEqual({});
        expect(loginStateLogout.isAuthenticated).toBe(false);
    });
});
