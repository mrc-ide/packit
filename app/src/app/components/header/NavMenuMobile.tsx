import { Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "../Base/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../Base/DropdownMenu";
import { LeftNavItems } from "./LeftNav";

export const NavMenuMobile = () => (
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Button variant="ghost" size="icon">
        <Menu />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-48">
      {Object.entries(LeftNavItems).map(([to, title]) => (
        <DropdownMenuItem key={to} asChild>
          <NavLink to={to}>{title}</NavLink>
        </DropdownMenuItem>
      ))}
      <DropdownMenuItem asChild>
        <NavLink to="/accessibility">Accessability</NavLink>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
