import { useParams } from "react-router-dom";
import { Sidebar } from "../contents/common/Sidebar";
import { PacketOutlet } from "./PacketOutlet";
import { SidebarItem } from "../../../lib/types/SidebarItem";

const getSideBarNavItems = (packetName = "", packetId = ""): SidebarItem[] => [
  {
    to: `/${packetName}/${packetId}`,
    title: "Summary"
  },
  {
    to: `/${packetName}/${packetId}/metadata`,
    title: "Metadata"
  },
  {
    to: `/${packetName}/${packetId}/downloads`,
    title: "Downloads"
  }
  // {
  //   to: `/${packetName}/${packetId}/changelogs`,
  //   title: "Change logs"
  // }
];

export const PacketLayout = () => {
  const { packetId, packetName } = useParams();
  const sidebarItems = getSideBarNavItems(packetName, packetId);

  return (
    <Sidebar sidebarItems={sidebarItems}>
      <PacketOutlet packetId={packetId} />
    </Sidebar>
  );
};
