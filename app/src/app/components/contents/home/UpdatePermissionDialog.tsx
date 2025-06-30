import { Dispatch, SetStateAction } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../Base/Dialog";
import { useGetRolesAndUsersToUpdatePacketGroupRead } from "./hooks/useGetRolesAndUsersToUpdatePacketGroupRead";
import { UpdatePacketReadPermissionForm } from "./UpdatePacketReadPermissionForm";
import { Loader2 } from "lucide-react";
import { ErrorComponent } from "../common/ErrorComponent";

export interface UpdatePermissionDialogContentProps {
  packetGroupName: string;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  dialogOpen: boolean;
}

export const UpdatePermissionDialog = ({
  packetGroupName,
  setDialogOpen,
  dialogOpen
}: UpdatePermissionDialogContentProps) => {
  const { rolesAndUsers, mutate, isLoading, error } = useGetRolesAndUsersToUpdatePacketGroupRead(packetGroupName);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen} defaultOpen={dialogOpen}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Update read access on {packetGroupName}</DialogTitle>
        </DialogHeader>
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin" />
          </div>
        )}
        {error && <ErrorComponent message="Error fetching roles and users for update" error={error} />}
        {rolesAndUsers && (
          <UpdatePacketReadPermissionForm
            rolesAndUsersCannotRead={rolesAndUsers.cannotRead}
            rolesAndUsersWithRead={rolesAndUsers.withRead}
            setDialogOpen={setDialogOpen}
            packetGroupName={packetGroupName}
            mutate={mutate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
