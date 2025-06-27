import { UserCog } from "lucide-react";
import { useState } from "react";
import { KeyedMutator } from "swr";
import { PacketMetadata } from "../../../../types";
import { Button } from "../../Base/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../Base/Dialog";
import { UpdatePacketReadPermissionForm } from "../home/UpdatePacketReadPermissionForm";
import { RolesAndUsersToUpdateRead, BasicRolesAndUsers } from "../admin/types/RoleWithRelationships";

interface UpdatePacketReadButtonProps {
  packet: PacketMetadata;
  rolesAndUsersCannotRead: BasicRolesAndUsers;
  rolesAndUsersWithRead: BasicRolesAndUsers;
  mutate: KeyedMutator<RolesAndUsersToUpdateRead>;
}

export const UpdatePacketReadButton = ({
  packet,
  rolesAndUsersCannotRead,
  rolesAndUsersWithRead,
  mutate
}: UpdatePacketReadButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

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
          rolesAndUsersCannotRead={rolesAndUsersCannotRead}
          rolesAndUsersWithRead={rolesAndUsersWithRead}
          setDialogOpen={setDialogOpen}
          packetGroupName={packet.name}
          mutate={mutate}
          packetId={packet.id}
        />
      </DialogContent>
    </Dialog>
  );
};
