import { UserCog } from "lucide-react";
import { useState } from "react";
import { KeyedMutator } from "swr";
import { Button } from "../../Base/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../Base/Dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../Base/Tooltip";
import { RoleWithRelationships } from "../manageAccess/types/RoleWithRelationships";
import { UserWithRoles } from "../manageAccess/types/UserWithRoles";
import { UpdatePacketReadPermissionForm } from "./UpdatePacketReadPermissionForm";
import { getRolesAndUsersCantReadGroup } from "./utils/getRolesAndUsersCantReadGroup";
import { getRolesAndUsersWithOnlyReadGroupPermission } from "./utils/getRolesAndUsersWithOnlyReadGroupPermission";

interface UpdatePermissionDialogProps {
  roles: RoleWithRelationships[];
  users: UserWithRoles[];
  packetGroupName: string;
  mutate: KeyedMutator<RoleWithRelationships[]>;
}
export const UpdatePermissionDialog = ({ roles, users, packetGroupName, mutate }: UpdatePermissionDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const rolesAndUsersCantReadGroup = getRolesAndUsersCantReadGroup(roles, users, packetGroupName);
  const rolesAndUsersWithReadGroup = getRolesAndUsersWithOnlyReadGroupPermission(roles, users, packetGroupName);

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
          rolesAndUsersCantRead={rolesAndUsersCantReadGroup}
          rolesAndUsersWithRead={rolesAndUsersWithReadGroup}
          setDialogOpen={setDialogOpen}
          packetGroupName={packetGroupName}
          mutate={mutate}
        />
      </DialogContent>
    </Dialog>
  );
};
