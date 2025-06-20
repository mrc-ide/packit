import { rest } from "msw";
import { Theme } from "../app/components/providers/types/ThemeTypes";
import { server } from "../msw/server";
import { brandingConfigUrl } from "../msw/handlers/brandingHandlers";
import { mockBrandingConfig } from "./mocks";

export const expectThemeClass = (expectedTheme: Theme) => {
  const root = window.document.documentElement;
  expect(root.classList.contains(expectedTheme)).toBe(true);
  expect(root.classList.length).toBe(1);
};

export const handleRequestWithEnabledThemes = (themes: Theme[]) => {
  server.use(
    rest.get(brandingConfigUrl, (req, res, ctx) => {
      const darkModeEnabled = themes.includes("dark");
      const lightModeEnabled = themes.includes("light");
      return res(ctx.json({ ...mockBrandingConfig, darkModeEnabled, lightModeEnabled }));
    })
  );
};
