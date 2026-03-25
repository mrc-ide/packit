import { Outlet } from "react-router-dom";
import { hasPacketRunPermission } from "@lib/auth/hasPermission";
import { SidebarItem } from "@lib/types/SidebarItem";
import { useUser } from "../../providers/UserProvider";
import { Sidebar } from "../common/Sidebar";
import { Unauthorized } from "../common/Unauthorized";
import { Skeleton } from "@components/Base/Skeleton";

const sidebarItems: SidebarItem[] = [
  {
    to: "/runner",
    title: "Run"
  },
  {
    to: "/runner/logs",
    title: "Logs"
  },
  {
    to: "/runner/packages",
    title: "Package versions"
  }
];

export const PacketRunnerLayout = () => {
  const { authorities, isLoading } = useUser();

  if (isLoading) {
    return <Skeleton className="w-full h-32" />;
  }

  if (!hasPacketRunPermission(authorities)) {
    return <Unauthorized />;
  }

  return (
    <Sidebar sidebarItems={sidebarItems}>
      <Outlet />
    </Sidebar>
  );
};
