import { SidebarItem } from "@lib/types/SidebarItem";
import { Sidebar } from "../common/Sidebar";
import { ManageAccessOutlet } from "./ManageAccessOutlet";

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
      <ManageAccessOutlet />
    </Sidebar>
  );
};
