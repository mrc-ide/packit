import { Sidebar } from "../common/Sidebar";
import { SidebarItem } from "../../../../lib/types/SidebarItem";
import { useUser } from "../../providers/UserProvider";
import { Unauthorized } from "../common/Unauthorized";
import { ManageAccessOutlet } from "./ManageAccessOutlet";
import { hasUserManagePermission } from "../../../../lib/auth/hasPermission";

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

  if (!hasUserManagePermission(user?.authorities)) {
    return <Unauthorized />;
  }
  return (
    <Sidebar sidebarItems={sidebarItems}>
      <ManageAccessOutlet />
    </Sidebar>
  );
};
