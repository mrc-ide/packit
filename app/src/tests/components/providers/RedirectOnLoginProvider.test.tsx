import { render, screen, waitFor } from "@testing-library/react";
import { RedirectOnLoginProvider, useRedirectOnLogin } from "@components/providers/RedirectOnLoginProvider";
import { useEffect } from "react";

const getItemSpy = vitest.spyOn(Storage.prototype, "getItem");
const setItemSpy = vitest.spyOn(Storage.prototype, "setItem");
const removeItemSpy = vitest.spyOn(Storage.prototype, "removeItem");

describe("RedirectOnLoginProvider", () => {
  const renderElement = (children: JSX.Element) => {
    return render(<RedirectOnLoginProvider>{children}</RedirectOnLoginProvider>);
  };

  beforeEach(() => {
    vitest.clearAllMocks();
    getItemSpy.mockImplementation(() => "/test");
  });

  it("provides loggingOut value", () => {
    const TestComponent = () => {
      const { loggingOut } = useRedirectOnLogin();
      return <span data-testid="logging-out">{loggingOut ? "true" : "false"}</span>;
    };
    renderElement(<TestComponent />);
    expect(screen.getByTestId("logging-out")).toHaveTextContent("false");
  });

  it("can set loggingOut value", async () => {
    const TestComponent = () => {
      const { loggingOut, setLoggingOut } = useRedirectOnLogin();
      useEffect(() => setLoggingOut(true), []);
      return <span data-testid="logging-out">{loggingOut ? "true" : "false"}</span>;
    };
    renderElement(<TestComponent />);
    await waitFor(() => {
      expect(screen.getByTestId("logging-out")).toHaveTextContent("true");
    });
  });

  it("provides requestedUrl", () => {
    const TestComponent = () => {
      const { requestedUrl } = useRedirectOnLogin();
      return <span data-testid="requested-url">{requestedUrl}</span>;
    };
    renderElement(<TestComponent />);
    expect(screen.getByTestId("requested-url")).toHaveTextContent("/test");
    expect(getItemSpy).toHaveBeenCalledWith("requestedUrl");
  });

  it("sets requestedUrl", () => {
    const TestComponent = () => {
      const { setRequestedUrl } = useRedirectOnLogin();
      useEffect(() => {
        setRequestedUrl("/new");
      });
      return <></>;
    };
    renderElement(<TestComponent />);
    expect(setItemSpy).toHaveBeenCalledWith("requestedUrl", "/new");
  });

  it("resets requestedUrl", () => {
    const TestComponent = () => {
      const { setRequestedUrl } = useRedirectOnLogin();
      useEffect(() => {
        setRequestedUrl(null);
      });
      return <></>;
    };
    renderElement(<TestComponent />);
    expect(removeItemSpy).toHaveBeenCalledWith("requestedUrl");
  });
});
