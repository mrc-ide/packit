import { SidebarItem } from "../../../../lib/types/SidebarItem";
import { Sidebar } from "../common/Sidebar";
import { AdminOutlet } from "./AdminOutlet";
import { useUser } from "../../providers/UserProvider";
import { hasGlobalPacketManagePermission, hasUserManagePermission } from "../../../../lib/auth/hasPermission";

export const AdminLayout = () => {
  const { authorities } = useUser();
  const sidebarItems: SidebarItem[] = [];
  if (hasUserManagePermission(authorities)) {
    sidebarItems.push(
      {
        to: "/manage-roles",
        title: "Manage Roles"
      },
      {
        to: "/manage-users",
        title: "Manage Users"
      }
    );
  }

  if (hasGlobalPacketManagePermission(authorities)) {
    sidebarItems.push({
      to: "/resync-packets",
      title: "Resync Packets"
    });
  }

  return <Sidebar sidebarItems={sidebarItems}>{authorities && <AdminOutlet authorities={authorities} />}</Sidebar>;
};
