import { Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { canReadPacket } from "../../../../lib/auth/hasPermission";
import { mapPermissionsToNames } from "../../../../lib/constructPermissionName";
import { HttpStatus } from "../../../../lib/types/HttpStatus";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { ErrorComponent } from "../common/ErrorComponent";
import { Unauthorized } from "../common/Unauthorized";
import { PacketHeader } from "../packets";
import { PacketReadRolesTable } from "./PacketReadRolesTable";
import { PacketReadUsersList } from "./PacketReadUsersList";
import { UpdatePacketReadButton } from "./UpdatePacketReadButton";
import { useGetRolesAndUsersToUpdatePacketRead } from "./hooks/useGetRolesAndUsersToUpdatePacketRead";

export const PacketReadPermission = () => {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();
  const { rolesAndUsers, isLoading, error, mutate } = useGetRolesAndUsersToUpdatePacketRead(packetId);

  if (error?.status === HttpStatus.Unauthorized) return <Unauthorized />;
  if (error) return <ErrorComponent message="Error fetching data" error={error} />;

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    );

  return packet && packetId && packetName && rolesAndUsers ? (
    <>
      <div className="md:flex justify-between">
        <PacketHeader packetName={packetName} packetId={packetId} displayName={packet.displayName} />
        <UpdatePacketReadButton
          packet={packet}
          rolesAndUsersCantRead={rolesAndUsers.cantRead}
          rolesAndUsersWithRead={rolesAndUsers.withRead}
          mutate={mutate}
        />
      </div>
      {/* todo: get these from endpoint as well!!*/}
      <PacketReadRolesTable
        roles={rolesAndUsers.canRead.roles.filter((role) =>
          canReadPacket(mapPermissionsToNames(role.rolePermissions), packet.name, packet.id)
        )}
      />
      <PacketReadUsersList
        users={rolesAndUsers.canRead.users.filter((user) =>
          canReadPacket(mapPermissionsToNames(user.specificPermissions), packet.name, packet.id)
        )}
      />
    </>
  ) : null;
};
