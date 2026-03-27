import { Outlet } from "react-router-dom";
import { hasPacketRunPermission } from "@lib/auth/hasPermission";
import { SidebarItem } from "@lib/types/SidebarItem";
import { useUser } from "../../providers/UserProvider";
import { Sidebar } from "../common/Sidebar";
import { Unauthorized } from "../common/Unauthorized";
import { useRunnerConfig } from "../../providers/RunnerConfigProvider";

const sidebarItems: SidebarItem[] = [
  {
    to: "/runner",
    title: "Run"
  },
  {
    to: "/runner/logs",
    title: "Logs"
  }
];

export const PacketRunnerLayout = () => {
  const { authorities } = useUser();
  const isRunnerEnabled = useRunnerConfig();

  if (!hasPacketRunPermission(authorities) || isRunnerEnabled === false) {
    return <Unauthorized />;
  }
  return (
    <Sidebar sidebarItems={sidebarItems}>
      <Outlet />
    </Sidebar>
  );
};
