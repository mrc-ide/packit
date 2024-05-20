import { Outlet } from "react-router-dom";
import { Sidebar } from "../common/Sidebar";
import { SidebarItem } from "../../../../lib/types/SidebarItem";
import { useUser } from "../../providers/UserProvider";
import { Unauthorized } from "../common/Unauthorized";

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
  const { user } = useUser();

  if (!user?.authorities.includes("user.manage")) {
    return <Unauthorized />;
  }
  return (
    <Sidebar sidebarItems={sidebarItems}>
      <Outlet />
    </Sidebar>
  );
};
