import { Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "../Base/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../Base/DropdownMenu";
import { UserState } from "../providers/types/UserTypes";
import { LeftNavItems } from "./LeftNav";
import { hasPacketRunPermission } from "../../../lib/auth/hasPermission";

interface NavMenuMobileProps {
  user: UserState;
}
export const NavMenuMobile = ({ user }: NavMenuMobileProps) => {
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
            to === "runner" && !hasPacketRunPermission(user) ? null : (
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
