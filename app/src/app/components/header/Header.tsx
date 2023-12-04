import { PackageOpen } from "lucide-react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { RootState } from "../../../types";
import { NavigationLink } from "../Base/NavigationLink";
import AccountHeaderDropdown from "./AccountHeaderDropdown";
import { HeaderMenu } from "./HeaderMenu";
import { LeftNav } from "./LeftNav";
import { ThemeToggleButton } from "./ThemeToggleButton";

export default function Header() {
  const { isAuthenticated } = useSelector((state: RootState) => state.login);

  return (
    <header>
      <div data-testid="header" className="flex-col">
        <div className="border-b shadow-sm dark:shadow-accent">
          <div className="flex h-20 items-center px-4">
            <NavLink to="/">
              <div className="text-xl font-extrabold flex gap-1 items-center">
                <PackageOpen />
                Packit
              </div>
            </NavLink>
            <div className="mx-3 flex items-center md:hidden">
              <HeaderMenu />
            </div>
            {isAuthenticated && <LeftNav className="mx-6 hidden md:flex" />}
            <div className="ml-auto flex items-center space-x-4">
              <NavigationLink to="/accessibility" className="mx-6 hidden md:flex">
                Accessability
              </NavigationLink>
              <ThemeToggleButton />
              {isAuthenticated && <AccountHeaderDropdown />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
