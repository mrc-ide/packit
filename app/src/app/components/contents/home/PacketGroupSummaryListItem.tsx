import { ExternalLink, Hourglass, Layers, UserCog } from "lucide-react";
import { Link } from "react-router-dom";
import { getTimeDifferenceToDisplay } from "../../../../lib/time";
import { PacketGroupSummary } from "../../../../types";
import { RoleWithRelationships } from "../manageAccess/types/RoleWithRelationships";
import { UserWithRoles } from "../manageAccess/types/UserWithRoles";
import { Button } from "../../Base/Button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../Base/Dialog";
import { UpdatePacketReadPermissionForm } from "./UpdatePacketReadPermissionForm";
import { canManagePacketGroup } from "../../../../lib/auth/hasPermission";
import { useUser } from "../../providers/UserProvider";

interface PacketGroupSummaryListItemProps {
  packetGroup: PacketGroupSummary;
  roles?: RoleWithRelationships[];
  users?: UserWithRoles[];
}

export const PacketGroupSummaryListItem = ({ packetGroup, roles, users }: PacketGroupSummaryListItemProps) => {
  const { unit, value } = getTimeDifferenceToDisplay(packetGroup.latestTime)[0];
  const { user } = useUser();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <li key={packetGroup.latestId} className="flex p-4 justify-between border-b">
      <div className="flex flex-col">
        <Link to={`/${packetGroup.name}`} className="hover:underline decoration-blue-500 min-w-[50%] w-fit">
          <h3 className="scroll-m-20 text-lg font-semibold tracking-tight text-blue-500">
            {packetGroup.latestDisplayName}
          </h3>
        </Link>
        {packetGroup.name !== packetGroup.latestDisplayName && (
          <div className="text-muted-foreground text-sm items-center">{packetGroup.name}</div>
        )}
        <div className="flex flex-wrap gap-y-2 space-x-3 items-center mt-1">
          <Link
            to={`/${packetGroup.name}/${packetGroup.latestId}`}
            className=" text-blue-500 text-xs flex items-center gap-[1px]
          hover:underline decoration-blue-500"
          >
            <ExternalLink size={16} />
            <span className="ps-0.5">Latest</span>
          </Link>
          <div className="text-muted-foreground text-xs flex items-center gap-[1px]">
            <Layers size={16} className="opacity-50" />
            <span className="ps-0.5">
              {packetGroup.packetCount} {packetGroup.packetCount === 1 ? "packet" : "packets"}
            </span>
          </div>
          <div className="text-muted-foreground text-xs flex items-center gap-[1px]">
            <Hourglass size={16} className="opacity-50" />
            <span className="ps-0.5">
              Updated {value} {unit} ago
            </span>
          </div>
        </div>
      </div>
      {roles && users && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={!canManagePacketGroup(user, packetGroup.name)}
              aria-label={`manage-access-${packetGroup.name}`}
              variant="outline"
              size="icon"
            >
              <UserCog size={18} />
            </Button>
          </DialogTrigger>
          <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Update read access on {packetGroup.name}</DialogTitle>
            </DialogHeader>
            <UpdatePacketReadPermissionForm
              roles={roles}
              users={users}
              setDialogOpen={setDialogOpen}
              packetGroupName={packetGroup.name}
            />
          </DialogContent>
        </Dialog>
      )}
    </li>
  );
};
