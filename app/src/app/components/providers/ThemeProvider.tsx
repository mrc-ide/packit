import { createContext, useContext, useEffect, useState } from "react";
import { LocalStorageKeys } from "../../../lib/types/LocalStorageKeys";
import { Theme, ThemeProviderProps, ThemeProviderState } from "./types/ThemeTypes";
import { useGetBrandingConfig } from "./hooks/useGetBrandingConfig";
import { ErrorComponent } from "../contents/common/ErrorComponent";

// DEFAULT_THEME is to be used if both themes are available and no user preference is set in local storage
const DEFAULT_THEME = "system";
// PRIVILEGED_THEME is to be used if both themes are available, no user preference is set in local storage,
// and there is no system preference
const PRIVILEGED_THEME = "light";
const DEFAULT_AVAILABLE_THEMES: Theme[] = ["dark", "light"];

const ThemeProviderContext = createContext<ThemeProviderState>({
  availableThemes: DEFAULT_AVAILABLE_THEMES,
  theme: DEFAULT_THEME,
  setTheme: () => null
});

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

const getSystemTheme = (): Theme => {
  if (window.matchMedia("(prefers-color-scheme: dark)")?.matches) {
    return "dark";
  } else if (window.matchMedia("(prefers-color-scheme: light)")?.matches) {
    return "light";
  } else {
    return PRIVILEGED_THEME;
  }
};

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  const { brandingConfig, isLoading, error } = useGetBrandingConfig();

  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(LocalStorageKeys.THEME) as Theme) || DEFAULT_THEME
  );

  const [availableThemes, setAvailableThemes] = useState<Theme[]>([]);

  // Work out if the theme we're thinking of applying is available, and update the theme if not.
  const verifyThemeIsAvailable = () => {
    const proposedTheme = theme === "system" ? getSystemTheme() : theme;

    if (!availableThemes.includes(proposedTheme) && availableThemes.length !== 0) {
      setTheme(availableThemes[0]);
    }
  };

  useEffect(() => {
    if (!isLoading && brandingConfig) {
      if (brandingConfig.darkModeEnabled && !brandingConfig.lightModeEnabled) {
        setAvailableThemes(["dark"]);
      } else if (brandingConfig.lightModeEnabled && !brandingConfig.darkModeEnabled) {
        setAvailableThemes(["light"]);
      } else {
        setAvailableThemes(DEFAULT_AVAILABLE_THEMES);
      }
    }
  }, [brandingConfig, isLoading]);

  useEffect(verifyThemeIsAvailable, [availableThemes]);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove(...DEFAULT_AVAILABLE_THEMES);

    if (theme === "system") {
      const systemTheme = getSystemTheme();
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const value = {
    availableThemes,
    theme,
    setTheme: (theme: Theme) => {
      verifyThemeIsAvailable();
      setTheme(theme);
      localStorage.setItem(LocalStorageKeys.THEME, theme);
    }
  };

  if (error) return <ErrorComponent message={error.message} error={error} />;

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
};
