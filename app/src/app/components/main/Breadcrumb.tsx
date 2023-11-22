import { ChevronRight } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { capitalizeFirstLetter } from "../../../lib/string/pascalCase";

export const Breadcrumb = () => {
  const { pathname } = useLocation();
  const pathNames = pathname
    .split("/")
    .filter((x) => x)
    .map((x) => capitalizeFirstLetter(x));
  return (
    <>
      <div className="flex-col mb-2">
        <div className="border-b ">
          <div className="flex h-12 items-center px-4 justify-start space-x-1">
            {pathNames.length === 0 && <div className="font-medium ">Explorer</div>}
            {pathNames.map((path, index) => {
              const routeTo = `/${pathNames.slice(0, index + 1).join("/")}`;
              return index === pathNames.length - 1 ? (
                <div key={index}>{path}</div>
              ) : (
                <div className="flex space-x-1 justify-between items-center">
                  <NavLink
                    key={index}
                    to={routeTo}
                    className="transition-colors hover:text-primary text-muted-foreground"
                  >
                    {path}
                  </NavLink>
                  <ChevronRight className="" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
};
