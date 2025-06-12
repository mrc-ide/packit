export type Theme = "dark" | "light" | "system";

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export interface ThemeProviderState {
  availableThemes: Theme[];
  theme: Theme;
  setTheme: (theme: Theme) => void;
}
