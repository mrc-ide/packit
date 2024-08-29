import { UserState } from "../../app/components/providers/types/UserTypes";

export const hasUserManagePermission = (user: UserState | null) => !!user?.authorities.includes("user.manage");

export const hasPacketRunPermission = (user: UserState | null) => !!user?.authorities.includes("packet.run");
