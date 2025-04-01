import { Dispatch, SetStateAction, useState } from "react";
import { UserWithRoles } from "../manageAccess/types/UserWithRoles";
import { RoleWithRelationships } from "../manageAccess/types/RoleWithRelationships";
import { z } from "zod";

interface UpdatePacketReadPermissionFormProps {
  roles: RoleWithRelationships[];
  users: UserWithRoles[];
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  packetGroupName: string;
}
export const UpdatePacketReadPermissionForm = ({
  roles,
  users,
  setDialogOpen,
  packetGroupName
}: UpdatePacketReadPermissionFormProps) => {
  const [fetchError, setFetchError] = useState("");

  const formSchema = z.object({});

  return <div>UpdatePacketReadPermissionForm</div>;
};
