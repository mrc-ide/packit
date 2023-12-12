import { Outlet, useParams } from "react-router-dom";
import { SidebarNav } from "./SidebarNav";

// TODO: update show only when packet/:version is present
const getSideBarNavItems = (packetName: string, packetId: string) => [
  {
    to: `/${packetName}/${packetId}`,
    title: "Report"
  },
  {
    to: `/${packetName}/${packetId}/metadata`,
    title: "Metadata"
  },
  {
    to: `/${packetName}/${packetId}/downloads`,
    title: "Downloads"
  },
  {
    to: `/${packetName}/${packetId}/changelogs`,
    title: "Change logs"
  }
];
export const Sidebar = () => {
  const { packetId, packetName } = useParams();

  if (!packetId || !packetName) return null;

  const sidebarNavItems = getSideBarNavItems(packetName, packetId);

  return (
    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-10 lg:space-y-2">
      <aside data-testid="sidebar" className="lg:w-1/5 pl-2">
        <SidebarNav items={sidebarNavItems} />
      </aside>
      <div className="flex-1 lg:max-w-6xl">
        <Outlet />
      </div>
    </div>
  );
};
