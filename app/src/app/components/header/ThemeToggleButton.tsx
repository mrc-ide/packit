import { MoonStar, Sun } from "lucide-react";
import { Button } from "../Base/Button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../Base/Tooltip";
import { useTheme } from "../providers/ThemeProvider";

export const ThemeToggleButton = () => {
  const { theme, setTheme } = useTheme();
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
  const darkOrLightTheme = theme === "system" ? systemTheme : theme;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {darkOrLightTheme === "dark" ? (
            <Button aria-label="theme-dark" variant="ghost" size="icon" onClick={() => setTheme("light")}>
              <MoonStar />
            </Button>
          ) : (
            <Button aria-label="theme-light" variant="ghost" size="icon" onClick={() => setTheme("dark")}>
              <Sun />
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent align="end">
          <p>Toggle Theme</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
