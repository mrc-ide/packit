import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SWRConfig } from "swr";
import { Login } from "../../../app/components/login";
import { AuthConfigProvider } from "../../../app/components/providers/AuthConfigProvider";
import { RedirectOnLoginProvider } from "../../../app/components/providers/RedirectOnLoginProvider";
import { UserProvider } from "../../../app/components/providers/UserProvider";
import { UserState } from "../../../app/components/providers/types/UserTypes";
import appConfig from "../../../config/appConfig";
import { mockUserState } from "../../mocks";

const mockedUsedNavigate = vitest.fn();
vitest.mock("react-router-dom", async () => ({
  ...((await vitest.importActual("react-router-dom")) as any),
  useNavigate: () => mockedUsedNavigate
}));

const mockGetUserFromLocalStorage = vitest.fn((): null | UserState => null);
vitest.mock("../../../lib/localStorageManager", async () => ({
  ...((await vitest.importActual("../../../lib/localStorageManager")) as any),
  getUserFromLocalStorage: () => mockGetUserFromLocalStorage()
}));

describe("login", () => {
  const renderElement = () => {
    return render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <MemoryRouter initialEntries={["/login?error=random&info=Notification"]}>
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

  it("shows github and basic login when both auth config properties true", async () => {
    renderElement();

    expect(await screen.findByRole("link", { name: /github/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /log in with email/i })).toBeVisible();
  });

  it("can render github login button when authenticated and error from params", async () => {
    renderElement();

    const githubLink = await screen.findByRole("link", { name: /github/i });

    expect(githubLink).toBeVisible();
    expect(githubLink).toHaveAttribute("href", `${appConfig.apiUrl()}/oauth2/authorization/github`);
    expect(screen.getByText(/random/)).toBeInTheDocument();
  });

  it("should navigate if user token is present", () => {
    mockGetUserFromLocalStorage.mockReturnValue(mockUserState());
    renderElement();

    expect(mockedUsedNavigate).toHaveBeenCalledWith("/");
  });

  it("should show info message if info message is in search params", async () => {
    renderElement();

    expect(screen.getByText(/Notification/)).toBeInTheDocument();
  });
});
