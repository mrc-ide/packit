import { Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "../Base/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../Base/DropdownMenu";
import { LeftNavItems } from "./LeftNav";
import { hasPacketRunPermission } from "../../../lib/auth/hasPermission";

interface NavMenuMobileProps {
  authorities: string[];
}
export const NavMenuMobile = ({ authorities }: NavMenuMobileProps) => {
  return (
    <div className="mx-3 flex items-center md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          {Object.entries(LeftNavItems).map(([to, title]) =>
            to === "runner" && !hasPacketRunPermission(authorities) ? null : (
              <DropdownMenuItem key={to} asChild>
                <NavLink to={to}>{title}</NavLink>
              </DropdownMenuItem>
            )
          )}
          {/* <DropdownMenuItem asChild>
          <NavLink to="/accessibility">Accessibility</NavLink>
        </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
