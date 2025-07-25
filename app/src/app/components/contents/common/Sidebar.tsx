import { NavLink, useLocation } from "react-router-dom";
import { buttonVariants } from "@components/Base/Button";
import { cn } from "@lib/cn";
import { SidebarItem } from "@lib/types/SidebarItem";

interface SidebarProps {
  sidebarItems: SidebarItem[];
  children: React.ReactNode;
}
export const Sidebar = ({ sidebarItems, children }: SidebarProps) => {
  const { pathname } = useLocation();

  return (
    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-10 lg:space-y-2">
      <aside data-testid="sidebar" className="lg:w-1/6 pl-1 lg:pl-2">
        <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
          {sidebarItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.to}
              className={cn(buttonVariants({ variant: pathname === item.to ? "secondary" : "link" }), "justify-start")}
            >
              {item.title}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 lg:max-w-7xl h-full flex-col space-y-4 pl-8 lg:pl-0 pr-8 pb-8">{children}</div>
    </div>
  );
};
