import { MoonStar, Sun } from "lucide-react";
import { Button } from "../Base/Button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../Base/Tooltip";
import { useTheme } from "../providers/ThemeProvider";

export const ThemeToggleButton = () => {
  const { theme, availableThemes, setCurrentTheme } = useTheme();

  if (availableThemes.length <= 1) {
    return null; // Don't render the button if only one theme is available
  }

  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
  const currentTheme = theme === "system" ? systemTheme : theme;
  const otherTheme = currentTheme === "dark" ? "light" : "dark";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label={`theme-${otherTheme}`}
            className="rounded-full"
            variant="ghost"
            size="icon"
            onClick={() => setCurrentTheme(otherTheme)}
          >
            {currentTheme === "dark" ? <MoonStar /> : <Sun />}
          </Button>
        </TooltipTrigger>
        <TooltipContent align="end">
          <p>Toggle Theme</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
