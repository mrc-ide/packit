import { PackageOpen } from "lucide-react";
import { NavLink } from "react-router-dom";
import { AccountHeaderDropdown } from "./AccountHeaderDropdown";

import { useUser } from "../providers/UserProvider";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { NavMenu } from "./NavMenu";
import { useBrandingContext } from "../providers/BrandingProvider";

export const Header = () => {
  const { user } = useUser();
  const { logoConfig, logoConfigIsLoaded, brandName } = useBrandingContext();
  const logoLinkDestination = logoConfig?.linkDestination || "/";

  return (
    <header>
      <div data-testid="header">
        <div className="flex items-center h-20 border-b shadow-sm border-accent">
          {logoConfigIsLoaded && brandName && (
            <>
              {logoConfig?.filename && (
                <NavLink to={logoLinkDestination} className="h-full p-2 hidden md:block flex-shrink-0 ml-2 mr-6">
                  <img src={`/img/${logoConfig?.filename}`} className="h-full" alt={logoConfig?.altText} />
                </NavLink>
              )}
              <NavLink to="/" className="mx-4">
                <div className="text-xl font-extrabold flex gap-1 items-center tracking-tight">
                  {!logoConfig?.filename && <PackageOpen className="mr-1" />}
                  {brandName}
                </div>
              </NavLink>
            </>
          )}
          <div className="flex flex-1 h-20 items-center px-4">
            {user && <NavMenu className="hidden md:flex" user={user} />}
            <div className="flex items-center space-x-4 ml-auto">
              <ThemeToggleButton />
              {user && <AccountHeaderDropdown />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
