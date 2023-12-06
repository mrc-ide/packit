import { ChevronRight } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { capitalizeFirstLetter } from "../../../lib/string/capitalizeFirstLetter";

export const Breadcrumb = () => {
  const { pathname } = useLocation();
  // append first empty string to pathname to make sure the first element is always Home
  const pathNames = ["", ...pathname.split("/").filter((x) => x)];

  return (
    <>
      <div className="flex-col mb-2 border-b-2 shadow-sm">
        <div className="flex h-9 items-center px-4 justify-start space-x-1 text-sm">
          {pathNames.map((path, index) => {
            const routeTo = `${pathNames.slice(0, index + 1).join("/")}`;
            const displayName = routeTo === "" ? "Home" : capitalizeFirstLetter(path);

            return index === pathNames.length - 1 ? (
              <div key={index}>{displayName}</div>
            ) : (
              <div className="flex space-x-1 justify-between items-center" key={index}>
                <NavLink to={routeTo} className="transition-colors hover:text-primary text-muted-foreground">
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
