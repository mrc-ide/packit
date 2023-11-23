import { MoonStar, Sun } from "lucide-react";
import { Button } from "../Base/Button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../Base/Tooltip";
import { useTheme } from "../providers/ThemeProvider";

export const ThemeToggleButton = () => {
  const { theme, setTheme } = useTheme();
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const actualTheme = theme === "system" ? systemTheme : theme;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {actualTheme === "dark" ? (
            <Button variant="ghost" size="icon" onClick={() => setTheme("light")}>
              <MoonStar />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setTheme("dark")}>
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
