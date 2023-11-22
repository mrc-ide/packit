import { cn } from "../../../lib/cn";
import { NavigationLink } from "../Base/NavigationLink";

export function LeftNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <NavigationLink to="/">Explorer</NavigationLink>
      <NavigationLink to="/runner">Packet Runner</NavigationLink>
      <NavigationLink to="/run-workflow">Run Workflow</NavigationLink>
      <NavigationLink to="/documentation">Documentation</NavigationLink>
    </nav>
  );
}
