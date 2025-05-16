import { hasPacketRunPermission, hasUserManagePermission } from "../../../lib/auth/hasPermission";
import { cn } from "../../../lib/cn";
import { UserState } from "../providers/types/UserTypes";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../Base/DropdownMenu";
import { Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button, buttonVariants } from "../Base/Button";

export const NavItems: { [key: string]: string } = {
  runner: "Runner",
  "manage-roles": "Manage Access"
  // "run-workflow": "Workflow Runner",
  // documentation: "Documentation",
  // accessibility: "Accessibility",
};

interface NavMenuProps extends React.HTMLAttributes<HTMLElement> {
  user: UserState;
}
export const NavMenu = ({ className, user, ...props }: NavMenuProps) => {
  const displayableItems = Object.keys(NavItems).filter((to) => {
    if (to === "runner" && !hasPacketRunPermission(user.authorities)) {
      return false;
    } else if (to === "manage-roles" && !hasUserManagePermission(user.authorities)) {
      return false;
    } else {
      return true;
    }
  });

  return (
    <div className="flex-1">
      <nav className={cn("flex items-center space-x-2 pr-4 lg:pr-6 justify-end", className)} {...props}>
        {displayableItems.map((to) => (
          <NavLink
            to={to}
            key={to}
            className={({ isActive }) =>
              cn(
                "transition-colors hover:text-primary",
                {
                  "text-muted-foreground": !isActive
                },
                buttonVariants({ variant: "link" }),
                className
              )
            }
          >
            {NavItems[to]}
          </NavLink>
        ))}
      </nav>
      <div className="mx-3 flex items-center md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link" size="icon">
              <Menu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            {displayableItems.map((to) => (
              <DropdownMenuItem key={to} asChild>
                <NavLink to={to}>{NavItems[to]}</NavLink>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
