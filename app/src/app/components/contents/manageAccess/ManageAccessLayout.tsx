import { Outlet } from "react-router-dom";
import { Sidebar } from "../common/Sidebar";
import { SidebarItem } from "../../../../lib/types/SidebarItem";

const sidebarItems: SidebarItem[] = [
  {
    to: "/manage-roles",
    title: "Manage Roles"
  },
  {
    to: "/manage-users",
    title: "Manage Users"
  }
];

export const ManageAccessLayout = () => {
  return (
    <Sidebar sidebarItems={sidebarItems}>
      <Outlet />
    </Sidebar>
  );
};
