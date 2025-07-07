import { EllipsisVertical } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Button } from "@components/Base/Button";
import { DialogTrigger } from "@components/Base/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@components/Base/DropdownMenu";

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
        <DialogTrigger asChild onClick={() => setSelectedOption(manageType === "user" ? "roles" : "users")}>
          <DropdownMenuItem>Update {manageType === "user" ? "roles" : "users"}</DropdownMenuItem>
        </DialogTrigger>
        <DialogTrigger asChild onClick={() => setSelectedOption("permissions")}>
          <DropdownMenuItem>Update permissions</DropdownMenuItem>
        </DialogTrigger>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
