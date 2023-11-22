import { Outlet, useParams } from "react-router-dom";
import { SidebarNav } from "./SidebarNav";

// TODO: update show only when packetId/:version is present
const getSideBarNavItems = (packetId: string) => [
  {
    to: `/${packetId}`,
    title: "Report"
  },
  {
    to: `/${packetId}/metadata`,
    title: "Metadata"
  },
  {
    to: `/${packetId}/downloads`,
    title: "Downloads"
  },
  {
    to: `/${packetId}/changelogs`,
    title: "Change logs"
  }
];
export const Sidebar = () => {
  const { packetId } = useParams();

  if (!packetId) return null;

  const sidebarNavItems = getSideBarNavItems(packetId);

  return (
    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-10 lg:space-y-2">
      <aside className="lg:w-1/5 pl-2">
        <SidebarNav items={sidebarNavItems} />
      </aside>
      <div className="flex-1 lg:max-w-6xl">
        <Outlet />
      </div>
    </div>
  );
};
