import { hasPacketRunPermission } from "../../../lib/auth/hasPermission";
import { cn } from "../../../lib/cn";
import { NavigationLink } from "../Base/NavigationLink";

export const LeftNavItems = {
  runner: "Runner"
  // "run-workflow": "Workflow Runner",
  // documentation: "Documentation"
};

interface LeftNavProps extends React.HTMLAttributes<HTMLElement> {
  authorities: string[];
}
export const LeftNav = ({ className, authorities, ...props }: LeftNavProps) => {
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      {Object.entries(LeftNavItems).map(([to, title]) =>
        to === "runner" && !hasPacketRunPermission(authorities) ? null : (
          <NavigationLink to={to} key={to}>
            {title}
          </NavigationLink>
        )
      )}
    </nav>
  );
};
