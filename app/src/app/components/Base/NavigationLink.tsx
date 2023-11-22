import { NavLink } from "react-router-dom";
import { cn } from "../../../lib/cn";
import { ReactNode } from "react";

interface NavigationLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
}
export const NavigationLink = ({ to, children, className }: NavigationLinkProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "text-lg font-medium transition-colors hover:text-primary",
          {
            "text-muted-foreground": !isActive
          },
          className
        )
      }
    >
      {children}
    </NavLink>
  );
};
