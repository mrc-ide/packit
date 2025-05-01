import { PackageOpen } from "lucide-react";
import { NavLink } from "react-router-dom";
import { AccountHeaderDropdown } from "./AccountHeaderDropdown";

import { useUser } from "../providers/UserProvider";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { NavMenu } from "./NavMenu";
import { useGetBranding } from "../contents/common/hooks/useGetBranding";
import { Breadcrumb } from "../main/Breadcrumb";
import { useBreadcrumbContext } from "../providers/BreadcrumbProvider";

export const Header = () => {
  const { user } = useUser();
  const { showBreadcrumbs } = useBreadcrumbContext()
  const { brandConfig, isLoading: brandConfigIsLoading } = useGetBranding();
  const logoLinkDestination = brandConfig?.logoLink || "/";

  return (
    <header>
      <div data-testid="header">
        <div className="flex items-center h-28 border-b shadow-sm dark:shadow-accent mb-2">
          {brandConfig?.logoFilename && (
            <NavLink to={logoLinkDestination} className="h-full p-2 hidden md:block flex-shrink-0">
              <img
                src={`/img/${brandConfig?.logoFilename}`}
                className="h-full mx-2"
                alt={brandConfig?.logoAltText}
              />
            </NavLink>
          )}
          <div className="h-full flex-1 flex flex-col">
            <div className="flex-1 flex items-center">
              <NavLink to="/" className="mx-4">
                <div className="text-xl font-extrabold flex gap-1 items-center tracking-tight">
                  {!brandConfig?.logoFilename && !brandConfigIsLoading && (<PackageOpen className="mr-1" />)}
                  {brandConfig?.brandName}
                </div>
              </NavLink>
              <div className="flex flex-1 h-20 items-center px-4">
                {user && <NavMenu className="hidden md:flex" user={user} />}
                <div className="flex items-center space-x-4 ml-auto">
                  <ThemeToggleButton />
                  {user && <AccountHeaderDropdown />}
                </div>
              </div>
            </div>
            {showBreadcrumbs && <Breadcrumb />}
          </div>
        </div>
      </div>
    </header>
  );
};
