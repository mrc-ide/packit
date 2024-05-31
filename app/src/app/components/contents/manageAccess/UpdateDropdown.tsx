import { Button } from "../../Base/Button";
import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../../Base/DropdownMenu";
import { DialogTrigger } from "../../Base/Dialog";
import { Dispatch, SetStateAction } from "react";

export type UpdateOptions = "roles" | "permissions" | "users";
interface UpdateDropdownProps {
  setSelectedOption: Dispatch<SetStateAction<UpdateOptions>>;
  manageType: "user" | "role";
}
export const UpdateDropdown = ({ setSelectedOption, manageType }: UpdateDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label={`edit-${manageType}`}>
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DialogTrigger asChild onClick={() => setSelectedOption(manageType === "user" ? "roles" : "users")}>
          <DropdownMenuItem>Update {manageType === "user" ? "Roles" : "Users"}</DropdownMenuItem>
        </DialogTrigger>
        <DialogTrigger asChild onClick={() => setSelectedOption("permissions")}>
          <DropdownMenuItem>Update Permissions</DropdownMenuItem>
        </DialogTrigger>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
