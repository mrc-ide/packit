export type Theme = "dark" | "light" | "system";

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export interface ThemeProviderState {
  availableThemes: Theme[];
  theme: Theme;
  setCurrentTheme: (theme: Theme) => void;
}
