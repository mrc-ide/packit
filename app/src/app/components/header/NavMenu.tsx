import {
  hasPacketRunPermission,
  hasUserManagePermission,
  hasGlobalPacketManagePermission
} from "@lib/auth/hasPermission";
import { cn } from "@lib/cn";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../Base/DropdownMenu";
import { Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button, buttonVariants } from "../Base/Button";
import { useRunnerConfig } from "../providers/RunnerConfigProvider";
interface NavMenuProps extends React.HTMLAttributes<HTMLElement> {
  authorities: string[];
}
export const NavMenu = ({ className, authorities, ...props }: NavMenuProps) => {
  const isRunnerEnabled = useRunnerConfig();
  const isLoading = isRunnerEnabled === null;

  const NavItems: { [key: string]: string } = {};

  if (hasPacketRunPermission(authorities) && !isLoading && isRunnerEnabled) {
    NavItems.runner = "Runner";
  }

  // Special case: route "Admin" to appropriate tab depending on user perms
  if (hasUserManagePermission(authorities) || hasGlobalPacketManagePermission(authorities)) {
    const key = hasUserManagePermission(authorities) ? "manage-roles" : "resync-packets";
    NavItems[key] = "Admin";
  }

  return (
    <div className="flex-1">
      <nav className={cn("flex items-center space-x-2 pr-4 lg:pr-6 justify-end", className)} {...props}>
        {Object.entries(NavItems).map(([to, label]) => (
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
            {label}
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
            {Object.entries(NavItems).map(([to, label]) => (
              <DropdownMenuItem key={to} asChild>
                <NavLink to={to}>{label}</NavLink>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
