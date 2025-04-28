import { hasPacketRunPermission } from "../../../lib/auth/hasPermission";
import { cn } from "../../../lib/cn";
import { NavigationLink } from "../header/NavigationLink";
import { UserState } from "../providers/types/UserTypes";

export const LeftNavItems = {
  runner: "Runner"
  // "run-workflow": "Workflow Runner",
  // documentation: "Documentation"
};

interface LeftNavProps extends React.HTMLAttributes<HTMLElement> {
  user: UserState;
}
export const LeftNav = ({ className, user, ...props }: LeftNavProps) => {
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      {Object.entries(LeftNavItems).map(([to, title]) =>
        to === "runner" && !hasPacketRunPermission(user) ? null : (
          <NavigationLink to={to} key={to}>
            {title}
          </NavigationLink>
        )
      )}
    </nav>
  );
};
