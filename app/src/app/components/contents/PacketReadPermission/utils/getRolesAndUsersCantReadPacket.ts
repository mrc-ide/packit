import { RoleWithRelationships } from "../../manageAccess/types/RoleWithRelationships";
import { UserWithRoles } from "../../manageAccess/types/UserWithRoles";

export const getRolesAndUsersCantReadPacket = (
  roles: RoleWithRelationships[],
  users: UserWithRoles,
  packetGroupName: string,
  packetId: string
) => {};
