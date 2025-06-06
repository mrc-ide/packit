import { createContext, useContext, useEffect, useState } from "react";
import { LocalStorageKeys } from "../../../lib/types/LocalStorageKeys";
import { Theme, ThemeProviderProps, ThemeProviderState } from "./types/ThemeTypes";
import { useGetBrandingConfig } from "./hooks/useGetBrandingConfig";
import { ErrorComponent } from "../contents/common/ErrorComponent";

// defaultTheme is to be used if both themes are available and no user preference is set in local storage
const defaultTheme = "system";
// privilegedTheme is to be used if both themes are available, no user preference is set in local storage,
// and there is no system preference
const privilegedTheme = "light";
const defaultAvailableThemes: Theme[] = ["dark", "light"];

const ThemeProviderContext = createContext<ThemeProviderState>({
  availableThemes: defaultAvailableThemes,
  theme: defaultTheme,
  setCurrentTheme: () => null
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
    return privilegedTheme;
  }
};

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  const { brandingConfig, isLoading, error } = useGetBrandingConfig();

  if (error) return <ErrorComponent message={error.message} error={error} />;

  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(LocalStorageKeys.THEME) as Theme) || defaultTheme
  );

  const [availableThemes, setAvailableThemes] = useState<Theme[]>([]);

  useEffect(() => {
    if (!isLoading && brandingConfig) {
      if (brandingConfig.darkModeEnabled && !brandingConfig.lightModeEnabled) {
        setAvailableThemes(["dark"]);
      } else if (brandingConfig.lightModeEnabled && !brandingConfig.darkModeEnabled) {
        setAvailableThemes(["light"]);
      } else {
        setAvailableThemes(defaultAvailableThemes);
      }
    }
  }, [brandingConfig, isLoading]);

  // Work out if the theme we're thinking of applying is available, and update the theme if not.
  const verifyThemeIsAvailable = () => {
    const proposedTheme = theme === "system" ? getSystemTheme() : theme;

    if (!availableThemes.includes(proposedTheme) && availableThemes.length !== 0) {
      setTheme(availableThemes[0]);
    }
  };

  useEffect(verifyThemeIsAvailable, [availableThemes]);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove(...defaultAvailableThemes);

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
    setCurrentTheme: (theme: Theme) => {
      verifyThemeIsAvailable();
      setTheme(theme);
      localStorage.setItem(LocalStorageKeys.THEME, theme);
    }
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
};
