import { Menu } from "lucide-react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { RootState } from "../../../types";
import { Button } from "../Base/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../Base/DropdownMenu";
import { LeftNavItems } from "./LeftNav";

export const NavMenuMobile = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.login);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        {isAuthenticated &&
          Object.entries(LeftNavItems).map(([to, title]) => (
            <DropdownMenuItem key={to} asChild>
              <NavLink to={to}>{title}</NavLink>
            </DropdownMenuItem>
          ))}
        <DropdownMenuItem asChild>
          <NavLink to="/accessibility">Accessibility</NavLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
