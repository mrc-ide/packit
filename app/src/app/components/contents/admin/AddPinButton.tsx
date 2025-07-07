import { SquarePlus } from "lucide-react";
import { useState } from "react";
import { Button } from "../../Base/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../Base/Dialog";
import { AddPinsForm } from "./AddPinsForm";
import { PacketMetadata } from "@/types";
import { KeyedMutator } from "swr";

interface AddPinButtonProps {
  mutate: KeyedMutator<PacketMetadata[]>;
}
export const AddPinButton = ({ mutate }: AddPinButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <SquarePlus className="mr-2 h-5 w-5" />
          Add pin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Pin a packet</DialogTitle>
        </DialogHeader>
        <AddPinsForm setOpen={setOpen} mutate={mutate} />
      </DialogContent>
    </Dialog>
  );
};
