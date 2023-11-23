import { NavLink } from "react-router-dom";
import { PackageOpen } from "lucide-react";
import { LeftNav } from "./LeftNav";
import { RootState } from "../../../types";
import { useSelector } from "react-redux";
import { NavigationLink } from "../Base/NavigationLink";
import { ThemeToggleButton } from "./ThemeToggleButton";
import HeaderDropDown from "./HeaderDropDown";

export default function Header() {
  const { isAuthenticated } = useSelector((state: RootState) => state.login);

  return (
    <header>
      <div data-testid="header" className="flex-col">
        <div className="border-b shadow-sm dark:shadow-accent">
          <div className="flex h-20 items-center px-4">
            <NavLink to="/">
              <div className="text-xl font-bold flex gap-1 items-center">
                <PackageOpen />
                Packit
              </div>
            </NavLink>
            {isAuthenticated && <LeftNav className="mx-6" />}
            <div className="ml-auto flex items-center space-x-4">
              <NavigationLink to="/accessibility">Accessability</NavigationLink>
              <ThemeToggleButton />
              {isAuthenticated && <HeaderDropDown />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
