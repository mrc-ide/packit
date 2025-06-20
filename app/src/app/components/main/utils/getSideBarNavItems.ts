import { canManagePacket } from "../../../../lib/auth/hasPermission";
import { SidebarItem } from "../../../../lib/types/SidebarItem";

export const getSideBarNavItems = (
  packetName = "",
  packetId = "",
  authorities: string[] = [],
  runTaskId = ""
): SidebarItem[] => [
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
  ...(runTaskId
    ? [
        {
          to: `/runner/logs/${runTaskId}`,
          title: "Creation logs"
        }
      ]
    : []),
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
