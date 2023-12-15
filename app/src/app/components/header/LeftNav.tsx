import { cn } from "../../../lib/cn";
import { NavigationLink } from "../Base/NavigationLink";

export const LeftNavItems = {
  runner: "Runner",
  "run-workflow": "Workflow Runner",
  documentation: "Documentation"
};

export const LeftNav = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => {
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      {Object.entries(LeftNavItems).map(([to, title]) => (
        <NavigationLink to={to} key={to}>
          {title}
        </NavigationLink>
      ))}
    </nav>
  );
};
