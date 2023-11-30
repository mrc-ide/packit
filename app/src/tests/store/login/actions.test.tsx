import mockAxios from "../../../../mockAxios";
import { actions, LoginMutationType } from "../../../app/store/login/loginThunks";
import { saveCurrentUser } from "../../../localStorageManager";
import { CurrentUser, UserLoginDetailProps } from "../../../types";
import { expectThunkActionWith } from "../testHelper";

describe("login actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios.reset();
    saveCurrentUser({ token: "fakeToken" });
  });

  afterEach(() => {
    localStorage.clear();
  });

  const userDetails: UserLoginDetailProps = { email: "test@example.com", password: "test" };

  it("should fetch token as expected", async () => {
    const response: CurrentUser = { token: "fakeToken" };

    const dispatch = jest.fn();
    await expectThunkActionWith<CurrentUser, UserLoginDetailProps>(
      dispatch,
      response,
      200,
      actions.fetchToken(userDetails),
      LoginMutationType.GetToken,
      "/auth/login"
    );
  });

  it("should handle errors when fetching token", async () => {
    const dispatch = jest.fn();
    await expectThunkActionWith<CurrentUser | string, UserLoginDetailProps>(
      dispatch,
      "ERROR",
      400,
      actions.fetchToken(userDetails),
      LoginMutationType.GetToken,
      "/auth/login"
    );
  });

  it("should fetch auth config as expected", async () => {
    const fakeResponse = { test: "test" };
    const dispatch = jest.fn();
    await expectThunkActionWith<Record<string, any>, void>(
      dispatch,
      fakeResponse,
      200,
      actions.fetchAuthConfig(),
      LoginMutationType.GetAuthConfig,
      "/auth/config"
    );
  });

  it("should handle fetch auth config when errored", async () => {
    const dispatch = jest.fn();
    await expectThunkActionWith<Record<string, any> | string, void>(
      dispatch,
      "Error",
      500,
      actions.fetchAuthConfig(),
      LoginMutationType.GetAuthConfig,
      "/auth/config"
    );
  });
});
