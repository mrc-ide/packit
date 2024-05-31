import { SquarePlus } from "lucide-react";
import { useState } from "react";
import { KeyedMutator } from "swr";
import { Button } from "../../Base/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../Base/Dialog";
import { AddUserForm } from "./AddUserForm";
import { RoleWithRelationships } from "./types/RoleWithRelationships";

interface AddBasicUserButtonProps {
  mutate: KeyedMutator<RoleWithRelationships[]>;
  roleNames: string[];
}
export const AddBasicUserButton = ({ mutate, roleNames }: AddBasicUserButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <SquarePlus className="mr-2 h-5 w-5" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Create new User</DialogTitle>
        </DialogHeader>
        <AddUserForm mutate={mutate} setOpen={setOpen} roleNames={roleNames} />
      </DialogContent>
    </Dialog>
  );
};
