import { Theme } from "../types/ThemeTypes";

// DEFAULT_THEME is to be used if both themes are available and no user preference is set in local storage
export const DEFAULT_THEME = "system";
// PRIVILEGED_THEME is to be used if both themes are available, no user preference is set in local storage,
// and there is no system preference
const PRIVILEGED_THEME = "light";
export const DEFAULT_AVAILABLE_THEMES: Theme[] = ["dark", "light"];

export const getSystemTheme = (): Theme => {
  if (window.matchMedia("(prefers-color-scheme: dark)")?.matches) {
    return "dark";
  } else if (window.matchMedia("(prefers-color-scheme: light)")?.matches) {
    return "light";
  } else {
    return PRIVILEGED_THEME;
  }
};
