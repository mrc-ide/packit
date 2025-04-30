import { UserCog } from "lucide-react";
import { useState } from "react";
import { Button } from "../../Base/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../Base/Dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../Base/Tooltip";
import { RolesAndUsersToUpdateRead } from "../manageAccess/types/RoleWithRelationships";
import { UpdatePacketReadPermissionForm } from "./UpdatePacketReadPermissionForm";
import { KeyedMutator } from "swr";

interface UpdatePermissionDialogProps {
  packetGroupName: string;
  rolesAndUsersToUpdateRead: RolesAndUsersToUpdateRead;
  mutate: KeyedMutator<Record<string, RolesAndUsersToUpdateRead>>;
}
export const UpdatePermissionDialog = ({
  packetGroupName,
  rolesAndUsersToUpdateRead,
  mutate
}: UpdatePermissionDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label={`manage-access-${packetGroupName}`}
              variant="outline"
              size="icon"
              onClick={() => setDialogOpen(true)}
            >
              <UserCog size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Update read access</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Update read access on {packetGroupName}</DialogTitle>
        </DialogHeader>

        <UpdatePacketReadPermissionForm
          // TODO: do array later on!! in showing of list. maybe just return strings also?
          rolesAndUsersCantRead={[
            ...rolesAndUsersToUpdateRead.cantRead.roles,
            ...rolesAndUsersToUpdateRead.cantRead.users
          ]}
          rolesAndUsersWithRead={[
            ...rolesAndUsersToUpdateRead.withRead.roles,
            ...rolesAndUsersToUpdateRead.withRead.users
          ]}
          setDialogOpen={setDialogOpen}
          packetGroupName={packetGroupName}
          mutate={mutate}
        />
      </DialogContent>
    </Dialog>
  );
};
