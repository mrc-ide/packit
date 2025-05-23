import { MoonStar, Sun } from "lucide-react";
import { Button } from "../Base/Button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../Base/Tooltip";
import { useTheme } from "../providers/ThemeProvider";

export const ThemeToggleButton = () => {
  const { theme, setTheme } = useTheme();
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
  const currentTheme = theme === "system" ? systemTheme : theme;
  const otherTheme = currentTheme === "dark" ? "light" : "dark";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label={`theme-${currentTheme}`}
            className="rounded-full"
            variant="ghost"
            size="icon"
            onClick={() => setTheme(otherTheme)}
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
