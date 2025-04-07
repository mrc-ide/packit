import { Loader2, UserCog } from "lucide-react";
import { useParams } from "react-router-dom";
import { HttpStatus } from "../../../../lib/types/HttpStatus";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { ErrorComponent } from "../common/ErrorComponent";
import { Unauthorized } from "../common/Unauthorized";
import { useGetRolesWithRelationships } from "../manageAccess/hooks/useGetRolesWithRelationships";
import { PacketHeader } from "../packets";
import { canManagePacket } from "../../../../lib/auth/hasPermission";
import { useUser } from "../../providers/UserProvider";
import { Button } from "../../Base/Button";
import { PacketReadRolesTable } from "./PacketReadRolesTable";

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

  return (
    <>
      <div className="md:flex justify-between">
        <PacketHeader packetName={packetName ?? ""} packetId={packetId ?? ""} displayName={packet?.displayName} />
        <Button>
          <UserCog className="mr-2 h-5 w-5" /> Update read access
        </Button>
      </div>
      {rolesResponse && <PacketReadRolesTable roles={rolesResponse.roles} />}
    </>
  );
};
