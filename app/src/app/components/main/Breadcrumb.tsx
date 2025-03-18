import { ChevronRight } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { kebabToSentenceCase } from "../../../lib/string";

export const Breadcrumb = () => {
  const { pathname } = useLocation();
  // append first empty string to pathname to make sure the first element is always Home
  const pathNames = ["", ...pathname.split("/").filter((x) => x)];

  return (
    <>
      <div className="flex-col mb-2 border-b-2 shadow-sm" data-testid="breadcrumb">
        <div className="flex h-9 items-center px-4 justify-start space-x-1 text-sm">
          {pathNames.map((path, index) => {
            const routeTo = `${pathNames.slice(0, index + 1).join("/")}`;
            const displayName = routeTo === "" ? "home" : kebabToSentenceCase(path);

            return index === pathNames.length - 1 ? (
              <div key={index}>{displayName}</div>
            ) : (
              <div className="flex space-x-1 justify-between items-center truncate" key={index}>
                <NavLink
                  to={routeTo}
                  className="transition-colors hover:text-primary text-muted-foreground truncate whitespace-nowrap"
                >
                  {displayName}
                </NavLink>
                <ChevronRight />
              </div>
            );
          })}
        </div>
      </div>
      <Outlet />
    </>
  );
};
