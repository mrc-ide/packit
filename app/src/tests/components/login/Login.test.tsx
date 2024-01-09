import { render, screen } from "@testing-library/react";
import { rest } from "msw";
import { MemoryRouter } from "react-router-dom";
import { SWRConfig } from "swr";
import { Login } from "../../../app/components/login";
import { AuthConfigProvider } from "../../../app/components/providers/AuthConfigProvider";
import { UserProvider } from "../../../app/components/providers/UserProvider";
import { UserState } from "../../../app/components/providers/types/UserTypes";
import appConfig from "../../../config/appConfig";
import { server } from "../../../msw/server";
import { mockUserState } from "../../mocks";
import {RedirectOnLoginProvider} from "../../../app/components/providers/RedirectOnLoginProvider";

const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => mockedUsedNavigate
}));
const mockGetUserFromLocalStorage = jest.fn((): null | UserState => null);
jest.mock("../../../lib/localStorageManager", () => ({
  ...(jest.requireActual("../../../lib/localStorageManager") as any),
  getUserFromLocalStorage: () => mockGetUserFromLocalStorage()
}));

describe("login", () => {
  const renderElement = () => {
    return render(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <MemoryRouter initialEntries={["/login?error=random"]}>
          <UserProvider>
            <RedirectOnLoginProvider>
              <AuthConfigProvider>
                <Login />
              </AuthConfigProvider>
            </RedirectOnLoginProvider>
          </UserProvider>
        </MemoryRouter>
      </SWRConfig>
    );
  };

  it("does not show github link when not in auth mode", async () => {
    server.use(
      rest.get("*", (req, res, ctx) => {
        return res(ctx.json(null));
      })
    );
    renderElement();

    await screen.findByText(/random/i);

    expect(screen.queryByRole("link", { name: /github/i })).not.toBeInTheDocument();
  });

  it("can render github login button when authenticated and error from params", async () => {
    renderElement();

    const githubLink = await screen.findByRole("link", { name: /github/i });

    expect(githubLink).toBeVisible();
    expect(githubLink).toHaveAttribute("href", `${appConfig.apiUrl()}/oauth2/authorization/github`);
    expect(screen.getByText(/random/)).toBeInTheDocument();
  });

  it("should navigate if user token is present", () => {
    mockGetUserFromLocalStorage.mockReturnValue(mockUserState);
    renderElement();

    expect(mockedUsedNavigate).toHaveBeenCalledWith("/");
  });
});
