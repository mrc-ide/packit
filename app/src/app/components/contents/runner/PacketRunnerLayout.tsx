import { Outlet } from "react-router-dom";
import { canManageAllPackets, hasPacketRunPermission } from "@lib/auth/hasPermission";
import { SidebarItem } from "@lib/types/SidebarItem";
import { useUser } from "../../providers/UserProvider";
import { Sidebar } from "../common/Sidebar";
import { Unauthorized } from "../common/Unauthorized";
import { Skeleton } from "@components/Base/Skeleton";

export const PacketRunnerLayout = () => {
  const { authorities, isLoading } = useUser();

  if (isLoading) {
    return <Skeleton className="w-full h-32" />;
  }

  if (!hasPacketRunPermission(authorities)) {
    return <Unauthorized />;
  }

  const sidebarItems: SidebarItem[] = [
    {
      to: "/runner",
      title: "Run"
    },
    {
      to: "/runner/logs",
      title: "Logs"
    },
    ...(canManageAllPackets(authorities)
      ? [
          {
            to: "/runner/packages",
            title: "Packages"
          }
        ]
      : [])
  ];

  return (
    <Sidebar sidebarItems={sidebarItems}>
      <Outlet />
    </Sidebar>
  );
};
