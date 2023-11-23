import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../../../lib/cn";

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
          "font-medium transition-colors hover:text-primary",
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