"use client";

import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../../../lib/cn";
import { buttonVariants } from "../Base/Button";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    to: string;
    title: string;
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const { pathname } = useLocation();

  return (
    <nav className={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)} {...props}>
      {items.map((item, index) => (
        <NavLink
          key={index}
          to={item.to}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.to ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
            "justify-start"
          )}
        >
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
}
