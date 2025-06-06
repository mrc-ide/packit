import { useParams } from "react-router-dom";
import { canManagePacket } from "../../../lib/auth/hasPermission";
import { SidebarItem } from "../../../lib/types/SidebarItem";
import { Sidebar } from "../contents/common/Sidebar";
import { useUser } from "../providers/UserProvider";
import { PacketOutlet } from "./PacketOutlet";

const getSideBarNavItems = (packetName = "", packetId = "", authorities: string[] = []): SidebarItem[] => [
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
  },
  ...(canManagePacket(authorities, packetName, packetId)
    ? [
        {
          to: `/${packetName}/${packetId}/read-access`,
          title: "Read access"
        }
      ]
    : [])

  // {
  //   to: `/${packetName}/${packetId}/changelogs`,
  //   title: "Change logs"
  // }
];

export const PacketLayout = () => {
  const { packetId, packetName } = useParams();
  const { authorities } = useUser();
  const sidebarItems = getSideBarNavItems(packetName, packetId, authorities);

  return (
    <Sidebar sidebarItems={sidebarItems}>
      <PacketOutlet />
    </Sidebar>
  );
};
