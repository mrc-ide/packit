import { createContext, useContext, useEffect, useState } from "react";
import { LocalStorageKeys } from "@lib/types/LocalStorageKeys";
import { Theme, ThemeProviderProps, ThemeProviderState } from "./types/ThemeTypes";
import { useGetBrandingConfig } from "./hooks/useGetBrandingConfig";
import { ErrorComponent } from "../contents/common/ErrorComponent";
import { DEFAULT_AVAILABLE_THEMES, DEFAULT_THEME, getSystemTheme } from "./utils/themeUtils";
import { BrandingConfiguration } from "@/types";

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

const getAvailableThemes = (isLoading: boolean, brandingConfig: BrandingConfiguration | undefined): Theme[] => {
  if (isLoading || !brandingConfig) {
    return [];
  } else if (brandingConfig.darkModeEnabled && !brandingConfig.lightModeEnabled) {
    return ["dark"];
  } else if (brandingConfig.lightModeEnabled && !brandingConfig.darkModeEnabled) {
    return ["light"];
  } else {
    return DEFAULT_AVAILABLE_THEMES;
  }
};

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  const { brandingConfig, isLoading, error } = useGetBrandingConfig();

  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(LocalStorageKeys.THEME) as Theme) || DEFAULT_THEME
  );

  const availableThemes = getAvailableThemes(isLoading, brandingConfig);

  useEffect(() => {
    if (!isLoading && brandingConfig) {
      const themeToSet = theme === "system" ? getSystemTheme() : theme;
      if (!availableThemes.includes(themeToSet) && availableThemes.length !== 0) {
        setTheme(availableThemes[0]);
      } else {
        setTheme(themeToSet);
      }
    }
  }, [brandingConfig, isLoading]);

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
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme);
      localStorage.setItem(LocalStorageKeys.THEME, newTheme);
    }
  };

  if (error) return <ErrorComponent message={error.message} error={error} />;

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
};
