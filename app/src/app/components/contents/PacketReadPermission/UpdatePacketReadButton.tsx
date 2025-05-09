import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../Base/Dialog";
import { Button } from "../../Base/Button";
import { UserCog } from "lucide-react";
import { PacketMetadata } from "../../../../types";
import { UserWithRoles } from "../manageAccess/types/UserWithRoles";
import { RoleWithRelationships } from "../manageAccess/types/RoleWithRelationships";
import { UpdatePacketReadPermissionForm } from "../home/UpdatePacketReadPermissionForm";
import { KeyedMutator } from "swr";
import { getRolesUsersWithOnlyReadPacketPermission } from "./utils/getRolesUsersWithOnlyReadPacketPermission";
import { getRolesAndUsersCantReadPacket } from "./utils/getRolesAndUsersCantReadPacket";

interface UpdatePacketReadButtonProps {
  packet: PacketMetadata;
  users: UserWithRoles[];
  roles: RoleWithRelationships[];
  mutate: KeyedMutator<RoleWithRelationships[]>;
}

export const UpdatePacketReadButton = ({ packet, users, roles, mutate }: UpdatePacketReadButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const rolesAndUsersCantReadPacket = getRolesAndUsersCantReadPacket(roles, users, packet.name, packet.id);
  const rolesAndUsersWithOnlyReadPacket = getRolesUsersWithOnlyReadPacketPermission(
    roles,
    users,
    packet.name,
    packet.id
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserCog className="mr-2 h-5 w-5" /> Update read access
        </Button>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Update read access on {packet.id}</DialogTitle>
        </DialogHeader>
        <UpdatePacketReadPermissionForm
          rolesAndUsersCantRead={rolesAndUsersCantReadPacket}
          rolesAndUsersWithRead={rolesAndUsersWithOnlyReadPacket}
          setDialogOpen={setDialogOpen}
          packetGroupName={packet.name}
          mutate={mutate}
          packetId={packet.id}
        />
      </DialogContent>
    </Dialog>
  );
};
