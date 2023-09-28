import loginReducer, {initialLoginState} from "../../../app/store/login/login";
import {actions} from "../../../app/store/login/loginThunks";
import {CurrentUser} from "../../../types";
import {getCurrentUser} from "../../../localStorageManager";


describe("login reducer", () => {
    beforeEach(() => {
        jest.clearAllMocks();
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

    it("should handle redirected save user", () => {
        const actions = {
            type: "login/saveUser",
            payload: fetchUserResponse
        };
        const loginState = loginReducer(initialLoginState, actions);

        expect(getCurrentUser()).toEqual(fetchUserResponse);
        expect(loginState.isAuthenticated).toBe(true);
        expect(loginState.user).toEqual(fetchUserResponse);
        expect(loginState.userError).toEqual(null);
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
            type: "login/logout"
        });

        expect(loginStateLogout.user).toEqual({});
        expect(loginStateLogout.isAuthenticated).toBe(false);
        expect(getCurrentUser()).toEqual(null);
    });
});
