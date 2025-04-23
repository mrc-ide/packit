import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { UserProvider } from "../../../app/components/providers/UserProvider";
import { UserAuthForm } from "../../../app/components/login/UserAuthForm";

const mockSetLoggingOut = jest.fn();
let mockLoggingOut = false;
jest.mock("../../../app/components/providers/RedirectOnLoginProvider", () => ({
  useRedirectOnLogin: () => ({
    setLoggingOut: mockSetLoggingOut,
    loggingOut: (() => mockLoggingOut)()
  })
}));

const mockWindowNavigate = jest.fn();
jest.mock("../../../lib/navigate", () => ({
  windowNavigate: (href) => mockWindowNavigate(href)
}));

const authConfig = {
  authEnabled: true,
  enableBasicLogin: true,
  enableGithubLogin: true,
  enablePreAuthLogin: false
};
const mockUseAuthConfig = jest.fn().mockReturnValue(authConfig);
jest.mock("../../../app/components/providers/AuthConfigProvider", () => ({
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
    jest.clearAllMocks();
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
