import loginReducer, {initialLoginState} from "../../../app/store/login/login";
import {actions} from "../../../app/store/login/loginThunks";
import {CurrentUser} from "../../../types";


describe("login reducer", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const fetchUserResponse: CurrentUser = {token: "fakeToken"};

    const authConfigResponse = {"TEST": "TEST"};

    it("should handle fetchPackets.fulfilled", () => {
        const loginState = loginReducer(initialLoginState, {
            type: actions.fetchToken.fulfilled.type,
            payload: fetchUserResponse,
        });

        expect(loginState.user).toEqual(fetchUserResponse);

        expect(loginState.tokenError).toBeNull();
    });

    it("should handle fetchPackets.rejected", async () => {
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

        expect(loginState.tokenError).toBe(error);
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
});
