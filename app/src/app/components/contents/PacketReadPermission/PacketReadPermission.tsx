import { Loader2, UserCog } from "lucide-react";
import { useParams } from "react-router-dom";
import { canManagePacket, canReadPacket } from "../../../../lib/auth/hasPermission";
import { mapPermissionsToNames } from "../../../../lib/constructPermissionName";
import { HttpStatus } from "../../../../lib/types/HttpStatus";
import { Button } from "../../Base/Button";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { useUser } from "../../providers/UserProvider";
import { ErrorComponent } from "../common/ErrorComponent";
import { Unauthorized } from "../common/Unauthorized";
import { useGetRolesWithRelationships } from "../manageAccess/hooks/useGetRolesWithRelationships";
import { PacketHeader } from "../packets";
import { PacketReadRolesTable } from "./PacketReadRolesTable";
import { PacketReadUsersList } from "./PacketReadUsersList";

export const PacketReadPermission = () => {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();
  const { user } = useUser();
  const rolesResponse = canManagePacket(user?.authorities, packetName ?? "", packetId ?? "")
    ? useGetRolesWithRelationships()
    : null;

  if (rolesResponse?.error?.status === HttpStatus.Unauthorized || rolesResponse === null) return <Unauthorized />;
  if (rolesResponse?.error) return <ErrorComponent message="Error fetching data" error={rolesResponse.error} />;

  if (rolesResponse?.isLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    );

  return packet && packetId && packetName ? (
    <>
      <div className="md:flex justify-between">
        <PacketHeader packetName={packetName} packetId={packetId} displayName={packet.displayName} />
        <Button>
          <UserCog className="mr-2 h-5 w-5" /> Update read access
        </Button>
      </div>
      {rolesResponse && (
        <>
          <PacketReadRolesTable
            roles={rolesResponse.roles.filter((role) =>
              canReadPacket(mapPermissionsToNames(role.rolePermissions), packet.name, packet.id)
            )}
          />
          <PacketReadUsersList
            users={rolesResponse.users.filter((user) =>
              canReadPacket(mapPermissionsToNames(user.specificPermissions), packet.name, packet.id)
            )}
          />
        </>
      )}
    </>
  ) : null;
};
