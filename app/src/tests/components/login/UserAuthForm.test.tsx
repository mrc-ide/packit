import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { UserProvider } from "@components/providers/UserProvider";
import { UserAuthForm } from "@components/login/UserAuthForm";

const mockSetLoggingOut = vitest.fn();
let mockLoggingOut = false;
vitest.mock("@components/providers/RedirectOnLoginProvider", () => ({
  useRedirectOnLogin: () => ({
    setLoggingOut: mockSetLoggingOut,
    loggingOut: (() => mockLoggingOut)()
  })
}));

const mockWindowNavigate = vitest.fn();
vitest.mock("../../../lib/navigate", () => ({
  windowNavigate: (href: string) => mockWindowNavigate(href)
}));

const authConfig = {
  authEnabled: true,
  enableBasicLogin: true,
  enableGithubLogin: true,
  enablePreAuthLogin: false
};
const mockUseAuthConfig = vitest.fn().mockReturnValue(authConfig);
vitest.mock("@components/providers/AuthConfigProvider", () => ({
  useAuthConfig: () => mockUseAuthConfig()
}));

describe("UserAuthForm", () => {
  const renderElement = () => {
    return render(
      <MemoryRouter>
        <UserProvider>
          <UserAuthForm></UserAuthForm>
        </UserProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vitest.clearAllMocks();
  });

  it("resets logging out", () => {
    mockLoggingOut = true;
    renderElement();
    expect(mockSetLoggingOut).toHaveBeenCalledWith(false);
  });

  it("does not reset logging out if not required", () => {
    mockLoggingOut = false;
    renderElement();
    expect(mockSetLoggingOut).not.toHaveBeenCalled();
  });

  it("does not redirect to external login if preauth is not enabled", () => {
    renderElement();
    expect(mockWindowNavigate).not.toHaveBeenCalled();
  });

  it("redirects to external login if preauth is enabled", () => {
    mockUseAuthConfig.mockReturnValueOnce({ ...authConfig, enablePreAuthLogin: true });
    renderElement();
    expect(mockWindowNavigate).toHaveBeenCalledWith("/login");
  });
});
