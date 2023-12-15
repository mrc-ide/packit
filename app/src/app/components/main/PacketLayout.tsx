import { useParams } from "react-router-dom";
import { PacketOutlet } from "./PacketOutlet";
import { PacketSidebarNav } from "./PacketSidebarNav";

const getSideBarNavItems = (packetName = "", packetId = "") => [
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

export const PacketLayout = () => {
  const { packetId, packetName } = useParams();
  const sidebarNavItems = getSideBarNavItems(packetName, packetId);

  return (
    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-10 lg:space-y-2">
      <aside data-testid="sidebar" className="lg:w-1/5 pl-1 lg:pl-2">
        <PacketSidebarNav items={sidebarNavItems} />
      </aside>
      <div className="flex-1 lg:max-w-6xl">
        <PacketOutlet packetId={packetId} />
      </div>
    </div>
  );
};
