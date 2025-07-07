import { hasGlobalPacketManagePermission } from "@/lib/auth/hasPermission";
import { SidebarItem } from "../../../../lib/types/SidebarItem";
import { Sidebar } from "../common/Sidebar";
import { ManageAccessOutlet } from "./ManageAccessOutlet";
import { useUser } from "../../providers/UserProvider";

export const ManageAccessLayout = () => {
  const { authorities } = useUser();

  const sidebarItems: SidebarItem[] = [
    {
      to: "/manage-roles",
      title: "Manage Roles"
    },
    {
      to: "/manage-users",
      title: "Manage Users"
    },
    ...(hasGlobalPacketManagePermission(authorities)
      ? [
          {
            to: "/manage-pins",
            title: "Manage Pins",
          },
        ]
      : [])
  ];

  return (
    <Sidebar sidebarItems={sidebarItems}>
      <ManageAccessOutlet />
    </Sidebar>
  );
};
