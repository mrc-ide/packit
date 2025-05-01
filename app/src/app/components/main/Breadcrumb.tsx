import { ChevronRight } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { kebabToSentenceCase } from "../../../lib/string";

export const Breadcrumb = () => {
  const { pathname } = useLocation();
  // append first empty string to pathname to make sure the first element is always Home
  const pathNames = ["", ...pathname.split("/").filter((x) => x)];

  return (
    <div
      data-testid="breadcrumb"
      className="flex flex-1 bg-accent rounded-tl-lg items-center pl-2 pr-4 justify-start space-x-1 text-sm"
      aria-label="Breadcrumb"
    >
      <ChevronRight />
      {pathNames.map((path, index) => {
        const routeTo = `${pathNames.slice(0, index + 1).join("/")}`;
        const displayName = routeTo === "" ? "home" : kebabToSentenceCase(path);

        return index === pathNames.length - 1 ? (
          <div key={index} aria-current="page">{displayName}</div>
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
  );
};
