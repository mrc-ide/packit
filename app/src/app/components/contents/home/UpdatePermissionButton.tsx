import { UserCog } from "lucide-react";
import { useState } from "react";
import { Button } from "@components/Base/Button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/Base/Tooltip";
import { UpdatePermissionDialog } from "./UpdatePermissionDialog";

interface UpdatePermissionDialogProps {
  packetGroupName: string;
}

export const UpdatePermissionButton = ({ packetGroupName }: UpdatePermissionDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label={`manage-access-${packetGroupName}`}
              variant="ghost"
              size="icon"
              onClick={() => setDialogOpen(true)}
            >
              <UserCog size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Update read access</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {dialogOpen && (
        <UpdatePermissionDialog
          packetGroupName={packetGroupName}
          setDialogOpen={setDialogOpen}
          dialogOpen={dialogOpen}
        />
      )}
    </>
  );
};
