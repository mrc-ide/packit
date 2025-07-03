import { render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../../../app/components/providers/ThemeProvider";
import { LocalStorageKeys } from "../../../lib/types/LocalStorageKeys";
import { SWRConfig } from "swr";
import { Theme } from "../../../app/components/providers/types/ThemeTypes";
import { expectThemeClass, handleRequestWithEnabledThemes } from "../../testUtils";

const mockSystemThemePreference = (theme: Theme) => {
  window.matchMedia = vitest.fn().mockImplementation((query) => ({
    matches: query === `(prefers-color-scheme: ${theme})`
  }));
};

describe("ThemeProvider", () => {
  const TestComponent = () => {
    const { availableThemes } = useTheme();

    return (
      <>
        <span data-testid="darkThemeAvailable">{availableThemes.includes("dark") ? "true" : "false"}</span>
        <span data-testid="lightThemeAvailable">{availableThemes.includes("light") ? "true" : "false"}</span>
      </>
    );
  };

  const renderTestElement = () => {
    return render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      </SWRConfig>
    );
  };

  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    localStorage.removeItem(LocalStorageKeys.THEME);
  });

  it("informs component which themes are available to be applied (both)", async () => {
    handleRequestWithEnabledThemes(["dark", "light"]);
    renderTestElement();

    await waitFor(() => {
      expect(screen.getByTestId("darkThemeAvailable")).toHaveTextContent("true");
      expect(screen.getByTestId("lightThemeAvailable")).toHaveTextContent("true");
    });
  });

  it("informs component which themes are available to be applied (dark only)", async () => {
    handleRequestWithEnabledThemes(["dark"]);

    renderTestElement();

    await waitFor(() => {
      expect(screen.getByTestId("darkThemeAvailable")).toHaveTextContent("true");
      expect(screen.getByTestId("lightThemeAvailable")).toHaveTextContent("false");
      expectThemeClass("dark");
    });
  });

  it("informs component which themes are available to be applied (light only)", async () => {
    handleRequestWithEnabledThemes(["light"]);

    renderTestElement();

    await waitFor(() => {
      expect(screen.getByTestId("darkThemeAvailable")).toHaveTextContent("false");
      expect(screen.getByTestId("lightThemeAvailable")).toHaveTextContent("true");
      expectThemeClass("light");
    });
  });

  it("sets the theme to dark when the local storage theme setting is dark", async () => {
    localStorage.setItem(LocalStorageKeys.THEME, "dark");

    renderTestElement();

    await waitFor(() => expectThemeClass("dark"));
  });

  it("sets the theme to light when the local storage theme setting is light", async () => {
    localStorage.setItem(LocalStorageKeys.THEME, "light");

    renderTestElement();

    await waitFor(() => expectThemeClass("light"));
  });

  it("overrides the local storage theme when that theme is not available to be applied", async () => {
    handleRequestWithEnabledThemes(["dark"]);

    localStorage.setItem(LocalStorageKeys.THEME, "light");

    renderTestElement();

    await waitFor(() => expectThemeClass("dark"));
  });

  it("sets the theme to light (default) when the local storage theme and system preference are unset", async () => {
    window.matchMedia = vitest.fn().mockImplementation(() => ({ matches: false }));

    renderTestElement();

    await waitFor(() => expectThemeClass("light"));
  });

  test("should respect a system preference for dark mode when the local storage theme setting is unset", async () => {
    mockSystemThemePreference("dark");

    renderTestElement();

    await waitFor(() => expectThemeClass("dark"));
  });

  test("should respect a system preference for light mode when the local storage theme setting is unset", async () => {
    mockSystemThemePreference("light");

    renderTestElement();

    await waitFor(() => expectThemeClass("light"));
  });

  it("overrides a system preference for light mode when that theme is not available to be applied", async () => {
    handleRequestWithEnabledThemes(["dark"]);

    mockSystemThemePreference("light");

    renderTestElement();

    await waitFor(() => expectThemeClass("dark"));
  });

  it("overrides a system preference for dark mode when that theme is not available to be applied", async () => {
    handleRequestWithEnabledThemes(["light"]);

    mockSystemThemePreference("dark");

    renderTestElement();

    await waitFor(() => expectThemeClass("light"));
  });
});
