import { PackageOpen } from "lucide-react";
import { NavLink } from "react-router-dom";
import { AccountHeaderDropdown } from "./AccountHeaderDropdown";

import { useUser } from "../providers/UserProvider";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { cn } from "../../../lib/cn";
import { buttonVariants } from "../Base/Button";
import { NavMenuMobile } from "./NavMenuMobile";
import { LeftNav } from "./LeftNav";
import { hasUserManagePermission } from "../../../lib/auth/hasPermission";
import { useGetBranding } from "./hooks/useGetBranding";

export const Header = () => {
  const { user } = useUser();
  const { brandConfig } = useGetBranding();

  return (
    <header>
      <div data-testid="header" className="flex-col">
        <div className="border-b shadow-sm dark:shadow-accent">
          <div className="flex h-20 items-center px-4">
            {brandConfig?.logoName && (
              <img
                src={`/img/${brandConfig?.logoName}`}
                height="100%"
                alt={brandConfig?.logoAltText}
              />
            )}
            <NavLink to="/">
              <div className="text-xl font-extrabold flex gap-1 items-center">
                {!brandConfig?.logoName && <PackageOpen />}
                {brandConfig?.brandName}
              </div>
            </NavLink>
            {user && <NavMenuMobile user={user} />}
            {user && <LeftNav className="mx-6 hidden md:flex" user={user} />}
            <div className="ml-auto flex items-center space-x-4">
              {/* <NavigationLink to="/accessibility" className="mx-6 hidden md:flex">
                Accessibility
              </NavigationLink> */}
              {hasUserManagePermission(user) && (
                <NavLink to="/manage-roles" className={cn(buttonVariants({ variant: "ghost" }), "justify-start")}>
                  Manage Access
                </NavLink>
              )}
              <ThemeToggleButton />
              {user && <AccountHeaderDropdown />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
