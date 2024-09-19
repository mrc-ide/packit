import { SquarePlus } from "lucide-react";
import { useState } from "react";
import { KeyedMutator } from "swr";
import { Button } from "../../Base/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../Base/Dialog";
import { AddRoleForm } from "./AddRoleForm";

interface AddRoleButtonProps {
  mutate: KeyedMutator<never>;
}
export const AddRoleButton = ({ mutate }: AddRoleButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <SquarePlus className="mr-2 h-5 w-5" />
          Add Role
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Add new Role</DialogTitle>
        </DialogHeader>
        <AddRoleForm mutate={mutate} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
};
