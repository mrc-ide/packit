import { createContext, useContext, useEffect, useState } from "react";
import { LocalStorageKeys } from "../../../lib/types/LocalStorageKeys";
import { Theme, ThemeProviderProps, ThemeProviderState } from "./types/ThemeTypes";

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "system",
  setTheme: () => null
});

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

export function ThemeProvider({ children, defaultTheme = "system", ...props }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(LocalStorageKeys.THEME) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(LocalStorageKeys.THEME, theme);
      setTheme(theme);
    }
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
