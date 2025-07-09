import { PinOffIcon } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@components/Base/Dialog";
import { DeletePinForm } from "./DeletePinForm";
import { PacketMetadata } from "@/types";
import { KeyedMutator } from "swr";

interface DeletePinButtonProps {
  packet: PacketMetadata;
  mutate: KeyedMutator<PacketMetadata[]>;
}
export const DeletePinButton = ({ packet, mutate }: DeletePinButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <PinOffIcon
          size={20}
          className="cursor-pointer stroke-destructive opacity-75 hover:opacity-100"
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Confirm pin deletion</DialogTitle>
        </DialogHeader>
        <DeletePinForm packet={packet} setOpen={setOpen} mutate={mutate} />
      </DialogContent>
    </Dialog>
  );
};
